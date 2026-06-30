"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthUser() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (userId) return { id: userId };

  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getUserProgress() {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data } = await db
      .from("User")
      .select("growthStage, growthPercent")
      .eq("id", user.id)
      .single();
    return data || { growthStage: "SEED", growthPercent: 0 };
  } catch { return { growthStage: "SEED", growthPercent: 0 }; }
}

export async function getRoadmapTasks() {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data } = await db
      .from("RoadmapTask")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: true });
    return data || [];
  } catch { return []; }
}

export async function toggleTaskStatus(taskId: string, newStatus: string) {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data: task } = await db
      .from("RoadmapTask")
      .update({ status: newStatus, updatedAt: new Date().toISOString() })
      .eq("id", taskId)
      .eq("userId", user.id)
      .select()
      .single();

    if (newStatus === "done" && task) {
      await db.from("ActivityLog").insert({
        id: crypto.randomUUID(),
        userId: user.id,
        action: "COMPLETED_TASK",
        details: task.title,
        createdAt: new Date().toISOString(),
      });
    }
    return task;
  } catch (e: any) { throw new Error(e.message); }
}

export async function getNotifications() {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data } = await db
      .from("Notification")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(20);
    return data || [];
  } catch { return []; }
}

export async function markNotificationRead(id: string) {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data } = await db
      .from("Notification")
      .update({ readStatus: true })
      .eq("id", id)
      .eq("userId", user.id)
      .select()
      .single();
    return data;
  } catch { return null; }
}

export async function getRecentActivity() {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data } = await db
      .from("ActivityLog")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(10);
    return data || [];
  } catch { return []; }
}

export async function getUpcomingDeadlines() {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const { data: saved } = await db
      .from("SavedScholarship")
      .select("scholarship:Scholarship(id, title, deadline, provider)")
      .eq("userId", user.id);

    return (saved || [])
      .map((s: any) => ({
        id: s.scholarship?.id,
        name: s.scholarship?.title,
        applicationDeadline: s.scholarship?.deadline,
        provider: s.scholarship?.provider,
      }))
      .filter(s => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
      .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
      .slice(0, 5);
  } catch { return []; }
}

export async function getDashboardData() {
  try {
    const db = getDb();
    const user = await getAuthUser();
    const userId = user.id;

    const [userResult, tasksResult, notificationsResult, activityResult, savedResult] = await Promise.all([
      db.from("User").select("growthStage, growthPercent, profile:StudentProfile(*)").eq("id", userId).single(),
      db.from("RoadmapTask").select("*").eq("userId", userId).order("createdAt", { ascending: true }),
      db.from("Notification").select("*").eq("userId", userId).order("createdAt", { ascending: false }).limit(20),
      db.from("ActivityLog").select("*").eq("userId", userId).order("createdAt", { ascending: false }).limit(10),
      db.from("SavedScholarship").select("scholarship:Scholarship(id, title, deadline, provider)").eq("userId", userId),
    ]);

    const dbUser = userResult.data;
    const profile: any = Array.isArray(dbUser?.profile) ? dbUser?.profile[0] : dbUser?.profile;

    // Profile completion
    let profileCompletion = 0;
    if (profile) {
      const fields = ['educationLevel','sscGpa','hscGpa','undergraduateCgpa','institutionName','country','city','district','familyIncome','gender'];
      const filled = fields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '').length;
      profileCompletion = Math.min(100, Math.round((filled / fields.length) * 100));
    }

    const upcomingDeadlines = (savedResult.data || [])
      .map((s: any) => ({
        id: s.scholarship?.id,
        name: s.scholarship?.title,
        applicationDeadline: s.scholarship?.deadline,
        provider: s.scholarship?.provider,
      }))
      .filter(s => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
      .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
      .slice(0, 5);

    return {
      userProgress: {
        growthStage: dbUser?.growthStage || "SEED",
        growthPercent: dbUser?.growthPercent || 0,
        profileCompletion,
      },
      roadmapTasks: tasksResult.data || [],
      notifications: notificationsResult.data || [],
      activityLogs: activityResult.data || [],
      upcomingDeadlines,
    };
  } catch (error: any) {
    console.error("getDashboardData error:", error.message);
    return {
      userProgress: { growthStage: "SEED", growthPercent: 0, profileCompletion: 0 },
      roadmapTasks: [],
      notifications: [],
      activityLogs: [],
      upcomingDeadlines: [],
    };
  }
}
