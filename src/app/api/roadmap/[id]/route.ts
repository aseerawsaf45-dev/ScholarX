import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const task = await prisma.roadmapTask.findUnique({
      where: { id, userId: authUser.id }
    });

    if (!task) return new NextResponse("Task not found", { status: 404 });

    const updatedTask = await prisma.roadmapTask.update({
      where: { id: task.id },
      data: { status }
    });

    const { awardPoints, revokePoints } = await import("@/lib/growth-engine");

    // If marked as completed, award points
    if (status === "COMPLETED" && task.status !== "COMPLETED") {
      await awardPoints(authUser.id, `Completed Task: ${task.title}`, task.impactOnTreeGrowth);
    } 
    // If unchecked/marked as incomplete, revoke points
    else if (status !== "COMPLETED" && task.status === "COMPLETED") {
      await revokePoints(authUser.id, `Completed Task: ${task.title}`);
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH Roadmap Task error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
