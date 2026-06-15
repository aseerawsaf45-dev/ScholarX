import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { syncRoadmapToDB } from "@/lib/roadmap/generator";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const tasks = await prisma.roadmapTask.findMany({
      where: { userId: user.id },
      orderBy: { priorityScore: 'desc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET Roadmap error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const tasks = await syncRoadmapToDB(user.id);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("POST Roadmap Generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
