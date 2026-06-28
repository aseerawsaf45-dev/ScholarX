import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RoadmapContainer } from "@/components/roadmap/RoadmapContainer";
import { TreeProgressSync } from "@/components/roadmap/TreeProgressSync";
import { Icon } from "@/components/ui/icon";

export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: {
      growthPercent: true,
      growthStage: true,
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Tree Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Icon name="Map" className="text-primary w-8 h-8" />
            AI Study-Abroad Roadmap
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Your personalized, step-by-step action plan to achieve your study-abroad goals. Complete tasks to grow your Scholarship Tree.
          </p>
        </div>
        <div className="lg:col-span-1 h-48">
          <TreeProgressSync 
            percent={user.growthPercent} 
            stage={user.growthStage} 
          />
        </div>
      </div>

      {/* Main Roadmap Kanban */}
      <RoadmapContainer />
    </div>
  );
}
