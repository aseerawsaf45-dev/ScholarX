"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const PRIORITY_CONFIG = {
  urgent: {
    label: "Urgent",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 text-red-500",
    dot: "bg-red-500",
  },
  high: {
    label: "High",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-500",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    badge: "bg-yellow-500/20 text-yellow-500",
    dot: "bg-yellow-500",
  },
};

const TYPE_ICON: Record<string, string> = {
  language: "Languages",
  research: "FlaskConical",
  leadership: "Users",
  portfolio: "Code2",
  scholarship: "GraduationCap",
};

export function AIRecommendationsWidget() {
  const { data, isLoading, isError } = useDashboardData();
  const suggestions = data?.aiSuggestions || [];

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError) return null;

  return (
    <Card className="h-full flex flex-col bg-primary/5 border-primary/20 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-primary flex items-center justify-between">
          AI Suggestions
          <Icon name="Sparkles" size={16} className="text-primary animate-pulse" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
            <Icon name="CircleCheck" size={32} className="mb-2 text-emerald-500" />
            <p className="text-sm font-medium text-foreground">You&apos;re well prepared!</p>
            <p className="text-xs mt-1">No critical gaps detected in your profile.</p>
          </div>
        ) : (
          suggestions.map((rec, i) => {
            const config = PRIORITY_CONFIG[rec.priority as keyof typeof PRIORITY_CONFIG];
            const iconName = TYPE_ICON[rec.type] || "Lightbulb";
            const isExternal = rec.actionUrl?.startsWith("http");

            return (
              <div
                key={i}
                className={`flex flex-col gap-2 border rounded-xl p-3 transition-colors ${config.bg}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.badge}`}>
                    <Icon name={iconName as any} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-foreground leading-tight truncate">{rec.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{rec.detail}</p>
                  </div>
                </div>

                {rec.actionUrl ? (
                  isExternal ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 text-[10px] font-semibold w-full justify-center rounded-lg border ${config.bg} ${config.color} hover:opacity-80`}
                      onClick={() => window.open(rec.actionUrl, "_blank")}
                    >
                      {rec.action} <Icon name="ArrowRight" size={10} className="ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 text-[10px] font-semibold w-full justify-center rounded-lg border ${config.bg} ${config.color} hover:opacity-80`}
                      asChild
                    >
                      <Link href={rec.actionUrl}>
                        {rec.action} <Icon name="ArrowRight" size={10} className="ml-1" />
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 text-[10px] font-semibold w-full justify-center rounded-lg border ${config.bg} ${config.color} hover:opacity-80`}
                    asChild
                  >
                    <Link href="/onboarding">
                      {rec.action} <Icon name="ArrowRight" size={10} className="ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
