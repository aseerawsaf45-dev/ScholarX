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

    // If marked as completed, update tree growth
    if (status === "COMPLETED" && task.status !== "COMPLETED") {
      const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
      if (dbUser) {
        let newPercent = Math.min(100, dbUser.growthPercent + task.impactOnTreeGrowth);
        
        let newStage = dbUser.growthStage;
        if (newPercent <= 20) newStage = "SEED";
        else if (newPercent <= 40) newStage = "SPROUT";
        else if (newPercent <= 60) newStage = "SAPLING";
        else if (newPercent <= 80) newStage = "GROWING_TREE";
        else if (newPercent <= 95) newStage = "SCHOLARSHIP_TREE";
        else newStage = "LEGACY_FOREST";

        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            growthPercent: newPercent,
            growthStage: newStage as any
          }
        });

        // Add Progress record
        await prisma.userProgress.create({
          data: {
            userId: dbUser.id,
            action: `Completed Task: ${task.title}`,
            points: task.impactOnTreeGrowth
          }
        });
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH Roadmap Task error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
