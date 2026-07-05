import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

type RoadmapTaskPayload = {
  title: string;
  description: string;
  category: "ESSENTIAL" | "HIGH_IMPACT" | "OPTIONAL";
  priorityScore: number;
  estimatedTimeDays: number;
  linkedScholarships: string[];
  dependencies: string[]; // local generated IDs to map
  impactOnTreeGrowth: number;
  _localId: string;
};

// Define deterministic tasks based on user gaps
export async function generateRoadmapTasks(userId: string): Promise<RoadmapTaskPayload[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      testScores: true,
      countryPreferences: true,
      documents: true,
      savedScholarships: {
        include: { scholarship: true }
      }
    }
  });

  if (!user) throw new Error("User not found");

  const tasks: RoadmapTaskPayload[] = [];
  const add = (t: RoadmapTaskPayload) => tasks.push(t);

  // GAP ANALYSIS ENGINE

  // 1. Profile Completeness
  if (!user.profile) {
    add({
      _localId: "complete_profile",
      title: "Complete Your Academic Profile",
      description: "Fill out your GPA, degree level, and educational background to unlock personalized scholarship matches.",
      category: "ESSENTIAL",
      priorityScore: 100, // Mandatory
      estimatedTimeDays: 1,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 20
    });
  }

  // 2. Country Preferences
  if (user.countryPreferences.length === 0) {
    add({
      _localId: "select_countries",
      title: "Select Target Study Destinations",
      description: "Choose the countries you are interested in to narrow down your scholarship search.",
      category: "HIGH_IMPACT",
      priorityScore: 80,
      estimatedTimeDays: 1,
      linkedScholarships: [],
      dependencies: user.profile ? [] : ["complete_profile"],
      impactOnTreeGrowth: 5
    });
  }

  // 3. Test Scores (IELTS/TOEFL)
  let needsIelts = false;
  if (!user.testScores?.ielts && !user.testScores?.toefl) {
    needsIelts = true;
    add({
      _localId: "prep_ielts",
      title: "Prepare for IELTS/TOEFL",
      description: "English proficiency is mandatory for most international scholarships. Start a preparation plan.",
      category: "ESSENTIAL",
      priorityScore: 90,
      estimatedTimeDays: 30,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 15
    });

    add({
      _localId: "take_ielts",
      title: "Take IELTS/TOEFL Exam",
      description: "Register for and complete your official English proficiency exam.",
      category: "ESSENTIAL",
      priorityScore: 100,
      estimatedTimeDays: 2,
      linkedScholarships: [],
      dependencies: ["prep_ielts"],
      impactOnTreeGrowth: 15
    });
  }

  // 4. Documents (CV, SOP, Passport)
  const hasCV = user.documents.some(d => d.type === "CV");
  const hasSOP = user.documents.some(d => d.type === "SOP");
  const hasPassport = user.documents.some(d => d.type === "OTHER" && d.name.toLowerCase().includes("passport"));

  if (!hasPassport) {
    add({
      _localId: "apply_passport",
      title: "Apply for a Passport",
      description: "You must have a valid passport to apply for international studies.",
      category: "ESSENTIAL",
      priorityScore: 100,
      estimatedTimeDays: 21,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 10
    });
  }

  if (!hasCV) {
    add({
      _localId: "build_cv",
      title: "Build an Academic CV",
      description: "Create a professional CV highlighting your education, achievements, and extracurriculars.",
      category: "HIGH_IMPACT",
      priorityScore: 85,
      estimatedTimeDays: 3,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 10
    });
  }

  if (!hasSOP) {
    add({
      _localId: "draft_sop",
      title: "Draft your Statement of Purpose (SOP)",
      description: "Write a compelling SOP outlining your motivations and career goals.",
      category: "HIGH_IMPACT",
      priorityScore: 95,
      estimatedTimeDays: 7,
      linkedScholarships: [],
      dependencies: ["build_cv"],
      impactOnTreeGrowth: 20
    });
  }

  // 5. Deeper Profile Gap Tasks
  if (user.profile?.researchExperience && !user.profile?.publications) {
    add({
      _localId: "publish_research",
      title: "Convert Research to a Publication",
      description: "You have research experience. Work with your supervisor to convert your findings into a conference paper or journal publication to boost your competitiveness.",
      category: "HIGH_IMPACT",
      priorityScore: 75,
      estimatedTimeDays: 45,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 15
    });
  }

  if (!user.profile?.leadership && !user.profile?.volunteerExperience) {
    add({
      _localId: "volunteer_leadership",
      title: "Build Leadership & Volunteer Profile",
      description: "Top scholarships (like Chevening, Fulbright) heavily weigh leadership and social impact. Join a local student club, NGO, or volunteer organization.",
      category: "HIGH_IMPACT",
      priorityScore: 70,
      estimatedTimeDays: 30,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 10
    });
  }

  if ((user.profile?.educationLevel === "University" || user.profile?.educationLevel === "HSC") && !user.profile?.projects) {
    add({
      _localId: "build_portfolio",
      title: "Build a Project Portfolio",
      description: "Create a GitHub repository or a personal portfolio showcasing your academic/technical projects to stand out to admissions committees.",
      category: "HIGH_IMPACT",
      priorityScore: 65,
      estimatedTimeDays: 14,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 8
    });
  }

  if (user.profile?.preferredUniversities) {
    add({
      _localId: "research_uni_requirements",
      title: `Research Requirements for ${user.profile.preferredUniversities.split(',')[0]}`,
      description: `Specifically map out the deadlines, GPA cutoffs, and document requirements for your preferred choice: ${user.profile.preferredUniversities}.`,
      category: "ESSENTIAL",
      priorityScore: 85,
      estimatedTimeDays: 3,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 12
    });
  }

  // 6. Saved Scholarships specific tasks
  if (user.savedScholarships.length === 0) {
    add({
      _localId: "find_scholarships",
      title: "Shortlist Scholarships",
      description: "Use the Explorer to find and save at least 3 scholarships that match your profile.",
      category: "HIGH_IMPACT",
      priorityScore: 80,
      estimatedTimeDays: 2,
      linkedScholarships: [],
      dependencies: ["complete_profile"],
      impactOnTreeGrowth: 15
    });
  } else {
    // Generate tasks for applying to saved scholarships
    for (const saved of user.savedScholarships) {
      const sch = saved.scholarship;
      
      // Calculate deadline pressure
      const daysUntilDeadline = Math.ceil((sch.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      let deadlineBoost = 0;
      if (daysUntilDeadline < 14) deadlineBoost = 20;
      else if (daysUntilDeadline < 30) deadlineBoost = 10;

      add({
        _localId: `apply_${sch.id}`,
        title: `Apply for ${sch.title}`,
        description: `Submit your application for the ${sch.title} in ${sch.country} before the deadline on ${sch.deadline.toLocaleDateString()}.`,
        category: "ESSENTIAL",
        priorityScore: Math.min(100, 80 + deadlineBoost),
        estimatedTimeDays: 5,
        linkedScholarships: [sch.id],
        dependencies: [
          ...(hasSOP ? [] : ["draft_sop"]),
          ...(hasCV ? [] : ["build_cv"]),
          ...(needsIelts ? ["take_ielts"] : []),
          ...(!hasPassport ? ["apply_passport"] : [])
        ],
        impactOnTreeGrowth: 25
      });
    }
  }

  return tasks;
}

/**
 * Generates scholarship-specific improvement tasks from the scoring engine's gap analysis.
 * This ensures the roadmap reflects exactly what the student needs to improve their match score
 * for each saved scholarship.
 */
export async function generateScholarshipImprovementTasks(userId: string): Promise<RoadmapTaskPayload[]> {
  const { generateImprovements, calculateEligibilityScore } = await import("@/lib/scoring-engine");

  const [userProfile, testScores, countryPreferences, careerGoal, documents, savedScholarships] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.testScores.findUnique({ where: { userId } }),
    prisma.countryPreference.findMany({ where: { userId } }),
    prisma.careerGoal.findUnique({ where: { userId } }),
    prisma.document.findMany({ where: { userId } }),
    prisma.savedScholarship.findMany({
      where: { userId },
      include: { scholarship: true },
      take: 5, // limit to top 5 saved scholarships
    }),
  ]);

  if (!userProfile) return [];

  const userData = { profile: userProfile, testScores, countryPreferences, careerGoal, documents };
  const tasks: RoadmapTaskPayload[] = [];
  const addedKeys = new Set<string>(); // avoid duplicate tasks across scholarships

  for (const saved of savedScholarships) {
    const sch = saved.scholarship;
    const improvements = generateImprovements(userData, sch);
    for (const improvement of improvements) {
      const key = `${improvement.category}_${improvement.gap}`;
      if (addedKeys.has(key)) continue;
      addedKeys.add(key);

      const localId = `improve_${improvement.category}_${sch.id.slice(0, 8)}`;
      const impactMap: Record<string, number> = { critical: 90, high: 75, medium: 60, low: 40 };
      const growthMap: Record<string, number> = { critical: 15, high: 10, medium: 7, low: 3 };
      const dayMap: Record<string, number> = { critical: 14, high: 30, medium: 45, low: 60 };
      const catMap: Record<string, "ESSENTIAL" | "HIGH_IMPACT" | "OPTIONAL"> = {
        critical: "ESSENTIAL", high: "HIGH_IMPACT", medium: "HIGH_IMPACT", low: "OPTIONAL"
      };

      tasks.push({
        _localId: localId,
        title: improvement.gap,
        description: `[For ${sch.title}] ${improvement.action}`,
        category: catMap[improvement.impact],
        priorityScore: impactMap[improvement.impact] || 60,
        estimatedTimeDays: dayMap[improvement.impact] || 30,
        linkedScholarships: [sch.id],
        dependencies: [],
        impactOnTreeGrowth: growthMap[improvement.impact] || 5,
      });
    }
  }

  return tasks;
}

export async function enhanceRoadmapWithAI(tasks: RoadmapTaskPayload[], userId: string): Promise<RoadmapTaskPayload[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, countryPreferences: true }
    });

    const profile = user?.profile;
    const testScores = await prisma.testScores.findUnique({ where: { userId } });
    const careerGoal = await prisma.careerGoal.findUnique({ where: { userId } });
    const interests = await prisma.interest.findMany({ where: { userId } });

    // We only enhance the top 5 highest priority tasks to save tokens
    const topTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);

    const prompt = `You are ScholarRoad AI — an elite international education strategist and personalized scholarship roadmap coach.

STUDENT FULL PROFILE:
- Education Level: ${profile?.educationLevel || 'N/A'}
- Institution: ${profile?.institutionName || 'N/A'}
- SSC GPA: ${profile?.sscGpa || 'N/A'} / HSC GPA: ${profile?.hscGpa || 'N/A'} / Bachelor CGPA: ${profile?.undergraduateCgpa || 'N/A'} / Master CGPA: ${profile?.graduateCgpa || 'N/A'}
- Current Semester: ${profile?.currentSemester || 'N/A'}
- Country: ${profile?.country || 'N/A'} / City: ${profile?.city || 'N/A'}
- Financial Need: ${profile?.familyIncome || 'N/A'}
- Target Countries: ${user?.countryPreferences.map((c: any) => c.country).join(", ") || 'Undecided'}
- Fields of Interest: ${interests.map((i: any) => i.field).join(", ") || 'Undecided'}
- Career Goal (Short-term): ${careerGoal?.desiredDegree || 'N/A'}
- Career Goal (Long-term): ${careerGoal?.longTermGoal || 'N/A'}
- IELTS: ${testScores?.ielts || 'Not taken'} / TOEFL: ${testScores?.toefl || 'Not taken'} / GRE: ${testScores?.gre || 'Not taken'} / SAT: ${testScores?.sat || 'Not taken'}
- Research Experience: ${profile?.researchExperience || 'None'}
- Publications: ${profile?.publications || 'None'}
- Projects: ${profile?.projects || 'None'}
- Leadership: ${profile?.leadership || 'None'}
- Volunteer Experience: ${profile?.volunteerExperience || 'None'}
- Work Experience: ${profile?.workExperience || 'None'}
- Programming Skills: ${profile?.programmingSkills || 'None'}
- Awards: ${profile?.awards || 'None'}
- Preferred Universities: ${profile?.preferredUniversities || 'None'}
- Special Circumstances: ${profile?.specialCircumstances || 'None'}

TASK: For each roadmap task below, write ONE highly specific, actionable, personalized coaching sentence that:
1. Directly references something from their profile (a specific GPA, test score, gap, country, career goal, etc.)
2. Explains WHY this task is important for THEIR specific situation
3. Gives a concrete first action step (not generic)

Output FORMAT (line by line, exactly):
[task_id] | [personalized coaching sentence]

TASKS TO COACH:
${topTasks.map(t => `${t._localId} | ${t.title}: ${t.description}`).join("\n")}`;

    const { text } = await generateText({
      model: groq('llama3-8b-8192'),
      prompt,
    });

    const lines = text.split('\n').filter(l => l.includes('|'));
    
    const suggestionMap: Record<string, string> = {};
    for (const line of lines) {
      const [id, suggestion] = line.split('|').map(s => s.trim());
      if (id && suggestion) {
        suggestionMap[id] = suggestion;
      }
    }

    return tasks.map(t => {
      if (suggestionMap[t._localId]) {
        return { ...t, aiSuggestion: suggestionMap[t._localId] };
      }
      return t;
    });

  } catch (error) {
    console.error("AI Roadmap Enhancement failed:", error);
    return tasks; // Return original if AI fails
  }
}

export async function syncRoadmapToDB(userId: string) {
  // 1. Generate Deterministic Tasks from profile gaps
  let generatedTasks = await generateRoadmapTasks(userId);

  // 2. Generate Scholarship-Specific Improvement Tasks
  const scholarshipImprovementTasks = await generateScholarshipImprovementTasks(userId);

  // Merge, deduplicating by title
  const allTaskTitles = new Set(generatedTasks.map(t => t.title));
  for (const t of scholarshipImprovementTasks) {
    if (!allTaskTitles.has(t.title)) {
      generatedTasks.push(t);
      allTaskTitles.add(t.title);
    }
  }

  // 3. Enhance with AI Layer
  generatedTasks = await enhanceRoadmapWithAI(generatedTasks, userId);

  // 3. Sync with DB (Delete old uncompleted tasks and replace? Or smartly merge)
  // For simplicity and to ensure a fully dynamic roadmap, we'll wipe existing 'NOT_STARTED' tasks
  // and re-insert. Completed tasks remain.
  
  const existingCompleted = await prisma.roadmapTask.findMany({
    where: { userId, status: "COMPLETED" },
    select: { title: true } // We use title as a rough unique key to prevent recreating completed tasks
  });
  const completedTitles = new Set(existingCompleted.map(t => t.title));

  // Filter out tasks the user has already completed
  const pendingTasks = generatedTasks.filter(t => !completedTitles.has(t.title));

  await prisma.roadmapTask.deleteMany({
    where: { userId, status: { not: "COMPLETED" } }
  });

  // Map local IDs to CUIDs for dependencies
  // We need to insert them and get their IDs, but to preserve dependency links we can pre-generate IDs or insert in order.
  // Since Prisma allows custom IDs, let's just generate random CUIDs in JS.
  const createId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const idMap = new Map<string, string>();
  for (const t of pendingTasks) {
    idMap.set(t._localId, createId());
  }

  const tasksToCreate = pendingTasks.map(t => ({
    id: idMap.get(t._localId)!,
    userId,
    title: t.title,
    description: t.description,
    category: t.category,
    priorityScore: t.priorityScore,
    estimatedTimeDays: t.estimatedTimeDays,
    linkedScholarships: t.linkedScholarships,
    dependencies: t.dependencies.map(dep => idMap.get(dep)).filter(Boolean) as string[],
    impactOnTreeGrowth: t.impactOnTreeGrowth,
    aiSuggestion: (t as any).aiSuggestion,
    status: "NOT_STARTED"
  }));

  if (tasksToCreate.length > 0) {
    await prisma.roadmapTask.createMany({
      data: tasksToCreate
    });
  }

  return await prisma.roadmapTask.findMany({
    where: { userId },
    orderBy: { priorityScore: 'desc' }
  });
}
