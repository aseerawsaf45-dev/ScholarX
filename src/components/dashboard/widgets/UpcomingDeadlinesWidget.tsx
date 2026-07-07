"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
          Upcoming Deadlines
          <Icon name="Calendar" size={16} className="text-primary/70" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pr-2">
        {deadlines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
            <Icon name="CalendarCheck" size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No upcoming deadlines.</p>
            <p className="text-xs">Save scholarships to track them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header row on desktop */}
            <div className="hidden sm:flex items-center justify-between px-3 pb-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider border-b border-border/40 mb-3">
              <div className="flex-1">Scholarship / Provider</div>
              <div className="flex items-center gap-4 shrink-0 min-w-[210px] justify-between">
                <div className="w-[100px] text-center">Status</div>
                <div className="w-[90px] text-right">Time Left</div>
              </div>
            </div>

            {/* List of deadline items */}
            {deadlines.map((scholarship) => {
              const daysLeft = differenceInDays(new Date(scholarship.applicationDeadline!), new Date());

              let colorClass = "text-green-500 bg-green-500/10 border-green-500/20";
              if (daysLeft <= 7) colorClass = "text-red-500 bg-red-500/10 border-red-500/20";
              else if (daysLeft <= 30) colorClass = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";

              // Check if scholarship has a status property
              const statusValue = (scholarship as any).status || "saved";

              return (
                <Link
                  href={`/scholarships/${scholarship.id}`}
                  key={scholarship.id}
                  className="flex items-center justify-between group p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/30 transition-all gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {scholarship.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{scholarship.provider}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 min-w-[210px] justify-between">
                    {/* Status badge centered */}
                    <div className="w-[100px] flex justify-center shrink-0">
                      <Badge
                        variant={
                          statusValue === "submitted" ? "default" :
                            statusValue === "applying" ? "secondary" :
                              statusValue === "rejected" ? "destructive" :
                                "outline"
                        }
                        className="capitalize text-[10px]"
                      >
                        {statusValue}
                      </Badge>
                    </div>

                    {/* Time remaining badge */}
                    <div className={`shrink-0 flex flex-col items-end px-2.5 py-1 rounded-lg border ${colorClass} w-[90px]`}>
                      <span className="text-xs font-bold leading-tight">{daysLeft}d left</span>
                      <span className="text-[9px] opacity-80 uppercase tracking-wider text-right truncate max-w-full mt-0.5">
                        {formatDistanceToNow(new Date(scholarship.applicationDeadline!), { addSuffix: false })}
                      </span>
                    </div>
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
