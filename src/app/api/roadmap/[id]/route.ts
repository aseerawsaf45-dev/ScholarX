import { NextResponse } from "next/server";
import { createClient as createAuthClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const supabase = await createAuthClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    // Find the task
    const { data: task, error: findErr } = await db
      .from("RoadmapTask")
      .select("*")
      .eq("id", id)
      .eq("userId", authUser.id)
      .single();

    if (findErr || !task) return new NextResponse("Task not found", { status: 404 });

    // Update task status
    const { data: updatedTask, error: updateErr } = await db
      .from("RoadmapTask")
      .update({ status, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    // If marked completed, update tree growth
    if (status === "COMPLETED" && task.status !== "COMPLETED") {
      const { data: dbUser } = await db
        .from("User")
        .select("growthPercent, growthStage")
        .eq("id", authUser.id)
        .single();

      if (dbUser) {
        const newPercent = Math.min(100, (dbUser.growthPercent || 0) + (task.impactOnTreeGrowth || 0));
        const newStage =
          newPercent <= 20 ? "SEED" :
          newPercent <= 40 ? "SPROUT" :
          newPercent <= 60 ? "SAPLING" :
          newPercent <= 80 ? "GROWING_TREE" :
          newPercent <= 95 ? "SCHOLARSHIP_TREE" :
          "LEGACY_FOREST";

        await db.from("User").update({ growthPercent: newPercent, growthStage: newStage }).eq("id", authUser.id);

        // Log progress
        await db.from("UserProgress").insert({
          id: crypto.randomUUID(),
          userId: authUser.id,
          action: `Completed Task: ${task.title}`,
          points: task.impactOnTreeGrowth || 0,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH Roadmap Task error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
