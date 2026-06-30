import { NextResponse } from "next/server";
import { createClient as createAuthClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { syncRoadmapToDB } from "@/lib/roadmap/generator";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  try {
    const db = getDb();
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: tasks, error } = await db
      .from("RoadmapTask")
      .select("*")
      .eq("userId", user.id)
      .order("priorityScore", { ascending: false });

    if (error) {
      console.error("Roadmap GET error:", error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("GET Roadmap error:", error);
    return NextResponse.json([]);
  }
}

export async function POST() {
  try {
    const db = getDb();
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
      const tasks = await syncRoadmapToDB(user.id);
      return NextResponse.json(tasks);
    } catch (prismaErr: any) {
      console.error("Roadmap generation (Prisma) error:", prismaErr.message);
      const { data: tasks } = await db
        .from("RoadmapTask")
        .select("*")
        .eq("userId", user.id)
        .order("priorityScore", { ascending: false });
      return NextResponse.json(tasks || []);
    }
  } catch (error) {
    console.error("POST Roadmap Generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
