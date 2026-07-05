"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import Link from "next/link";

export function UpcomingDeadlinesWidget() {
  const { data, isLoading, isError } = useDashboardData();
  const deadlines = data?.upcomingDeadlines || [];

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
          Upcoming Deadlines
          <Icon name="Calendar" size={16} className="text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2">
        {deadlines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Icon name="CalendarCheck" size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No upcoming deadlines.</p>
            <p className="text-xs">Save scholarships to track them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((scholarship) => {
              const daysLeft = differenceInDays(new Date(scholarship.applicationDeadline!), new Date());
              
              let colorClass = "text-green-500 bg-green-500/10";
              if (daysLeft <= 7) colorClass = "text-red-500 bg-red-500/10";
              else if (daysLeft <= 30) colorClass = "text-yellow-500 bg-yellow-500/10";

              return (
                <Link 
                  href={`/scholarships/${scholarship.id}`} 
                  key={scholarship.id}
                  className="flex items-start justify-between group p-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
                >
                  <div className="min-w-0 pr-4">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {scholarship.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{scholarship.provider}</p>
                  </div>
                  <div className={`shrink-0 flex flex-col items-end px-2 py-1 rounded-md ${colorClass}`}>
                    <span className="text-xs font-bold">{daysLeft}d left</span>
                    <span className="text-[10px] opacity-80 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(scholarship.applicationDeadline!), { addSuffix: false })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
