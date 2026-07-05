"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useRoadmapTasks } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useToggleTask } from "@/hooks/useDashboardData";

const CATEGORY_ICON: Record<string, string> = {
  ESSENTIAL: "AlertCircle",
  HIGH_IMPACT: "TrendingUp",
  OPTIONAL: "Info",
};

const CATEGORY_COLOR: Record<string, string> = {
  ESSENTIAL: "text-red-500 bg-red-500/10 border-red-500/20",
  HIGH_IMPACT: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  OPTIONAL: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
};

const CATEGORY_BADGE: Record<string, string> = {
  ESSENTIAL: "bg-red-500/20 text-red-600",
  HIGH_IMPACT: "bg-orange-500/20 text-orange-600",
  OPTIONAL: "bg-yellow-500/20 text-yellow-600",
};

export function ImprovementTipsWidget() {
  const { data: tasks, isLoading } = useRoadmapTasks();
  const { toggleTask, isToggling } = useToggleTask();

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  // Show only NOT_STARTED ESSENTIAL and HIGH_IMPACT tasks
  const criticalTasks = (tasks || [])
    .filter(t => t.status !== "COMPLETED" && (t.category === "ESSENTIAL" || t.category === "HIGH_IMPACT"))
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
    .slice(0, 4);

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-orange-500/5 via-background to-background border-orange-500/20 relative overflow-hidden">
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="TrendingUp" size={15} />
            Improvement Actions
          </span>
          <Link href="/dashboard/roadmap">
            <span className="text-[10px] font-normal text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
              Full Roadmap
            </span>
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-4">
        {criticalTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Icon name="CircleCheck" size={28} className="text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-foreground">All critical actions cleared!</p>
            <p className="text-xs text-muted-foreground mt-1">Keep completing roadmap tasks to grow your tree. 🌱</p>
          </div>
        ) : (
          criticalTasks.map((task) => {
            const colourCls = CATEGORY_COLOR[task.category] || CATEGORY_COLOR.OPTIONAL;
            const badgeCls = CATEGORY_BADGE[task.category] || CATEGORY_BADGE.OPTIONAL;
            const iconName = CATEGORY_ICON[task.category] || "Lightbulb";
            const isDone = task.status === "COMPLETED";

            return (
              <div
                key={task.id}
                className={`border rounded-xl p-3 flex flex-col gap-2 transition-all ${isDone ? "opacity-50 bg-muted/30 border-border" : `${colourCls.split(" ").slice(1).join(" ")}`}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${badgeCls}`}>
                    <Icon name={iconName as any} size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p className={`text-xs font-semibold leading-tight ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${badgeCls}`}>
                        {task.category === "ESSENTIAL" ? "Critical" : "High"}
                      </span>
                    </div>
                    {task.aiSuggestion ? (
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                        {task.aiSuggestion}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <Icon name="Clock" size={9} /> ~{task.estimatedTimeDays}d
                      </span>
                      <span className="text-[9px] text-muted-foreground">·</span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <Icon name="Zap" size={9} /> +{task.impactOnTreeGrowth} EXP
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isToggling}
                  onClick={() => toggleTask({ taskId: task.id, status: isDone ? "NOT_STARTED" : "COMPLETED" })}
                  className={`text-[10px] font-semibold h-6 w-full rounded-lg flex items-center justify-center gap-1 transition-colors border
                    ${isDone
                      ? "border-border text-muted-foreground hover:bg-muted"
                      : `${badgeCls} border-current hover:opacity-80`
                    }`}
                >
                  {isDone
                    ? <><Icon name="RotateCcw" size={10} /> Mark Incomplete</>
                    : <><Icon name="Check" size={10} /> Mark Complete</>
                  }
                </button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
