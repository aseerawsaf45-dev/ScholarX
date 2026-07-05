"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function RecentActivityWidget() {
  const { data, isLoading, isError } = useDashboardData();
  const activities = data?.activityLogs || [];

  if (isLoading) {
    return <Skeleton className="w-full h-64 rounded-xl" />;
  }

  if (isError) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          Recent Activity
          <Icon name="Activity" size={16} className="text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 relative">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="space-y-4 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-background bg-muted-foreground/20 text-muted-foreground group-[.is-active]:bg-primary/20 group-[.is-active]:text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                  <Icon name="Circle" size={8} className="fill-current" />
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] px-3 py-2 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-foreground capitalize">
                      {activity.action.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <time className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{activity.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
