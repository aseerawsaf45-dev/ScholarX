import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { RoadmapContainer } from "@/components/roadmap/RoadmapContainer";
import { TreeProgressSync } from "@/components/roadmap/TreeProgressSync";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RoadmapPage() {
  // Prefer the header set by middleware (no extra Supabase round-trip)
  const headerList = await headers();
  let userId = headerList.get('x-user-id');

  if (!userId) {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) redirect("/auth/login");
    userId = supabaseUser!.id;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  // User exists in Supabase but not in DB yet → send to onboarding, not login
  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Icon name="Map" className="text-primary w-8 h-8" />
            AI Study-Abroad Roadmap
          </h1>
          <p className="text-muted-foreground mt-1">
            Your personalized, step-by-step action plan to achieve your study-abroad goals. Complete tasks to grow your Scholarship Tree.
          </p>
        </div>
        <Button variant="outline" asChild className="shrink-0">
          <Link href="/dashboard">
            <Icon name="ArrowLeft" className="mr-2" size={16} /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header & Tree Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col justify-center bg-card p-6 rounded-2xl border border-border/80">
          <h2 className="text-xl font-bold mb-2">Track Your Progress</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            As you complete tasks in your roadmap, your Scholarship Tree will grow. Evolve your profile from a Seed to a full Forest and increase your chances of admission success.
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
