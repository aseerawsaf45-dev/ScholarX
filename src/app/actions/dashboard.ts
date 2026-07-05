"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

import { headers } from "next/headers";

async function getAuthUser() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (userId) {
    return { id: userId };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getUserProgress() {
  const user = await getAuthUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { growthStage: true, growthPercent: true }
  });
  return dbUser || { growthStage: "SEED", growthPercent: 0 };
}

export async function getRoadmapTasks() {
  const user = await getAuthUser();
  return prisma.roadmapTask.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' }
  });
}

export async function toggleTaskStatus(taskId: string, newStatus: string) {
  const user = await getAuthUser();
  
  const oldTask = await prisma.roadmapTask.findUnique({
    where: { id: taskId, userId: user.id }
  });

  if (!oldTask) throw new Error("Task not found");

  const task = await prisma.roadmapTask.update({
    where: { id: taskId, userId: user.id },
    data: { status: newStatus }
  });

  const { awardPoints, revokePoints } = await import("@/lib/growth-engine");

  // If marked as completed, award points
  if (newStatus === "COMPLETED" && oldTask.status !== "COMPLETED") {
    await awardPoints(user.id, `Completed Task: ${task.title}`, task.impactOnTreeGrowth);
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "COMPLETED_TASK",
        details: task.title
      }
    });
  }
  // If unmarked, revoke points
  else if (newStatus !== "COMPLETED" && oldTask.status === "COMPLETED") {
    await revokePoints(user.id, `Completed Task: ${task.title}`);
  }

  return task;
}

export async function getNotifications() {
  const user = await getAuthUser();
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

export async function markNotificationRead(id: string) {
  const user = await getAuthUser();
  return prisma.notification.update({
    where: { id, userId: user.id },
    data: { readStatus: true }
  });
}

export async function getRecentActivity() {
  const user = await getAuthUser();
  return prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

export async function getUpcomingDeadlines() {
  const user = await getAuthUser();
  // Fetch scholarships saved by the user with upcoming deadlines
  const saved = await prisma.savedScholarship.findMany({
    where: { userId: user.id },
    include: {
      scholarship: {
        select: { id: true, title: true, deadline: true, provider: true }
      }
    }
  });

  return saved
    .map(s => ({
      id: s.scholarship.id,
      name: s.scholarship.title,
      applicationDeadline: s.scholarship.deadline,
      provider: s.scholarship.provider
    }))
    .filter(s => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
    .slice(0, 5);
}

export async function getDashboardData() {
  const user = await getAuthUser();
  const userId = user.id;

  const [dbUser, roadmapTasks, notifications, activityLogs, saved, scholarshipMatches] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        growthStage: true,
        growthPercent: true,
        profile: true,
        testScores: true,
        countryPreferences: true,
        interests: true,
        careerGoal: true,
      }
    }),
    prisma.roadmapTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.savedScholarship.findMany({
      where: { userId },
      include: {
        scholarship: {
          select: { id: true, title: true, deadline: true, provider: true }
        }
      }
    }),
    prisma.scholarshipMatch.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
      take: 3,
      include: {
        scholarship: {
          select: { id: true, slug: true, title: true, provider: true, country: true, fundingType: true, deadline: true, requiredGPA: true, requiredIELTS: true }
        }
      }
    })
  ]);

  // Calculate profile completion
  let profileCompletion = 0;
  const profile = dbUser?.profile;
  if (profile) {
    const isUniversity = profile.educationLevel === "University";
    const basicFields = [
      'educationLevel',
      'institutionName',
      isUniversity ? 'undergraduateCgpa' : 'hscGpa',
      'country',
      'city',
      'familyIncome'
    ];
    const additionalFields = [
      'sscGpa',
      isUniversity ? 'hscGpa' : 'undergraduateCgpa',
      'graduateCgpa',
      'currentSemester',
      'researchExperience',
      'publications',
      'projects',
      'leadership',
      'volunteerExperience',
      'workExperience',
      'programmingSkills',
      'awards',
      'preferredUniversities',
      'specialCircumstances'
    ];

    let basicCount = 0;
    basicFields.forEach(field => {
      const val = profile[field as keyof typeof profile];
      if (val !== null && val !== undefined && val !== '') {
        basicCount++;
      }
    });

    let additionalCount = 0;
    additionalFields.forEach(field => {
      const val = profile[field as keyof typeof profile];
      if (val !== null && val !== undefined && val !== '') {
        additionalCount++;
      }
    });

    const basicScore = basicFields.length > 0 ? (basicCount / basicFields.length) * 70 : 0;
    const additionalScore = additionalFields.length > 0 ? (additionalCount / additionalFields.length) * 30 : 0;
    
    profileCompletion = Math.min(100, Math.round(basicScore + additionalScore));
  }

  // Format upcoming deadlines
  const upcomingDeadlines = saved
    .map(s => ({
      id: s.scholarship.id,
      name: s.scholarship.title,
      applicationDeadline: s.scholarship.deadline,
      provider: s.scholarship.provider
    }))
    .filter(s => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
    .slice(0, 5);

  // --- AI SUGGESTIONS ENGINE ---
  // Generate personalized suggestions based on actual profile gaps
  const prof = dbUser?.profile;
  const ts = dbUser?.testScores;
  const suggestions: Array<{ type: string; priority: 'urgent' | 'high' | 'medium'; title: string; detail: string; action: string; actionUrl?: string }> = [];

  if (!ts?.ielts && !ts?.toefl) {
    suggestions.push({
      type: 'language',
      priority: 'urgent',
      title: 'Take IELTS or TOEFL',
      detail: 'Language proficiency is required for 95%+ of international scholarships. Without it, most applications are automatically rejected.',
      action: 'Book IELTS Test',
      actionUrl: 'https://www.ielts.org/book-a-test'
    });
  } else if (ts?.ielts && ts.ielts < 6.5) {
    suggestions.push({
      type: 'language',
      priority: 'high',
      title: `Improve IELTS from ${ts.ielts} to 6.5+`,
      detail: 'Your current IELTS score is below the minimum threshold for most Master\'s scholarships. A 6.5+ opens access to 80% more opportunities.',
      action: 'Retake IELTS',
      actionUrl: 'https://www.ielts.org/book-a-test'
    });
  }

  if (!prof?.researchExperience && !prof?.publications) {
    const targetCountries = (dbUser?.countryPreferences || []).map((c: any) => c.country);
    const needsResearch = targetCountries.some((c: string) => ['Germany', 'Japan', 'South Korea', 'Sweden', 'Netherlands'].includes(c));
    suggestions.push({
      type: 'research',
      priority: needsResearch ? 'urgent' : 'high',
      title: 'Build Research Experience',
      detail: needsResearch
        ? `Research experience is strongly weighted for scholarships in ${targetCountries.filter((c: string) => ['Germany', 'Japan', 'South Korea', 'Sweden', 'Netherlands'].includes(c)).join(', ')}. Even a semester thesis dramatically improves competitiveness.`
        : 'Research projects, even a final-year thesis or lab internship, can increase your competitiveness score by 15-25 points across most research-based scholarships.',
      action: 'Join a Research Lab',
    });
  }

  if (!prof?.leadership && !prof?.volunteerExperience) {
    suggestions.push({
      type: 'leadership',
      priority: 'medium',
      title: 'Add Leadership or Volunteer Activity',
      detail: 'Scholarship committees look for students who give back to their communities. Leadership roles or NGO volunteer experience directly boost merit scores.',
      action: 'Find Volunteer Opportunities',
      actionUrl: 'https://www.idealist.org'
    });
  }

  if (prof && !prof.projects && !prof.programmingSkills) {
    suggestions.push({
      type: 'portfolio',
      priority: 'medium',
      title: 'Build a Technical Portfolio',
      detail: 'Candidates with GitHub profiles and practical projects score significantly higher on competitiveness evaluations, especially for STEM-focused scholarships.',
      action: 'Start a GitHub Portfolio',
      actionUrl: 'https://github.com'
    });
  }

  // Add top matched scholarship suggestions
  for (const match of scholarshipMatches) {
    const sc = match.scholarship;
    const daysLeft = sc.deadline ? Math.ceil((new Date(sc.deadline).getTime() - Date.now()) / 86400000) : null;
    if (daysLeft !== null && daysLeft > 0) {
      suggestions.push({
        type: 'scholarship',
        priority: daysLeft < 30 ? 'urgent' : daysLeft < 60 ? 'high' : 'medium',
        title: `Apply: ${sc.title}`,
        detail: `${Math.round(match.score)}% match score · ${sc.fundingType.replace('_', ' ')} · ${sc.country} · ${daysLeft} days left to apply`,
        action: 'View Scholarship',
        actionUrl: `/scholarships/${sc.slug}`
      });
    }
  }

  // Sort: urgent first, then high, then medium
  const priorityOrder = { urgent: 0, high: 1, medium: 2 };
  const aiSuggestions = suggestions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 4);

  return {
    userProgress: {
      growthStage: dbUser?.growthStage || "SEED",
      growthPercent: dbUser?.growthPercent || 0,
      profileCompletion
    },
    roadmapTasks,
    notifications,
    activityLogs,
    upcomingDeadlines,
    aiSuggestions
  };
}
