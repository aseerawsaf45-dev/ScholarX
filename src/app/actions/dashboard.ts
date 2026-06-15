"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

async function getAuthUser() {
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
  
  const task = await prisma.roadmapTask.update({
    where: { id: taskId, userId: user.id },
    data: { status: newStatus }
  });

  // Example of triggering growth on task completion
  if (newStatus === "done") {
    // You could call a growth logic module here
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "COMPLETED_TASK",
        details: task.title
      }
    });
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
        select: { id: true, name: true, applicationDeadline: true, provider: true }
      }
    }
  });

  return saved
    .map(s => s.scholarship)
    .filter(s => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
    .slice(0, 5);
}
