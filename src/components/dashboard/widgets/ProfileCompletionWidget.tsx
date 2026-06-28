"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function ProfileCompletionWidget() {
  const { data, isLoading, isError } = useDashboardData();
  const progress = data?.userProgress;

  if (isLoading) {
    return <Skeleton className="w-full h-48 rounded-xl" />;
  }

  if (isError || !progress) {
    return null;
  }

  const isComplete = progress.profileCompletion >= 100;

  return (
    <Card className="h-full bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          Profile Strength
          <Icon name="Target" size={16} className="text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * progress.profileCompletion) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{progress.profileCompletion}%</span>
            </div>
          </div>
          
          <div className="mt-4 w-full">
            {!isComplete ? (
              <div className="space-y-3">
                <p className="text-xs text-center text-muted-foreground">
                  Complete your profile to unlock personalized AI recommendations.
                </p>
                <Button className="w-full text-xs h-8" variant="default">
                  Fix Missing Fields
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-green-500">
                <Icon name="CheckCircle2" className="mb-1" />
                <p className="text-xs text-center font-medium">All set! Your profile is strong.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
