import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { syncUserDeadlines, getSortedUserDeadlines } from "@/lib/deadlines/deadlineEngine";
import { scheduleDeadlineReminders } from "@/lib/notifications/notificationEngine";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const deadlines = await getSortedUserDeadlines(user.id);
    return NextResponse.json(deadlines);
  } catch (error) {
    console.error("GET deadlines error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Sync User Deadlines from saved scholarships & matches
    const sortedDeadlines = await syncUserDeadlines(user.id);
    
    // 2. Schedule reminders based on the new deadlines
    await scheduleDeadlineReminders(user.id);

    return NextResponse.json(sortedDeadlines);
  } catch (error) {
    console.error("POST sync deadlines error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
