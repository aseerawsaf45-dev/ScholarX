"use client";

import { useRoadmapTasks } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export function RoadmapWidget() {
  const { data: tasks = [], isLoading, isError, toggleTask } = useRoadmapTasks();

  if (isLoading) {
    return <Skeleton className="w-full h-64 rounded-xl" />;
  }

  if (isError) {
    return null;
  }

  const completedCount = tasks.filter(t => t.status === "done").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            Roadmap
            <Icon name="Map" size={16} className="ml-2 text-primary/70" />
          </CardTitle>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 pt-2 space-y-3">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
            <p className="text-sm">No tasks generated yet.</p>
            <p className="text-xs mt-1">Complete your profile to generate a roadmap.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-start space-x-3 p-2 rounded-md transition-colors ${task.status === "done" ? "opacity-60" : "hover:bg-muted/50"}`}
            >
              <Checkbox 
                id={task.id} 
                checked={task.status === "done"} 
                onCheckedChange={(checked) => toggleTask({ taskId: task.id, status: checked ? "done" : "todo" })}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none flex-1 min-w-0">
                <label 
                  htmlFor={task.id} 
                  className={`text-sm font-medium leading-tight cursor-pointer ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </label>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
