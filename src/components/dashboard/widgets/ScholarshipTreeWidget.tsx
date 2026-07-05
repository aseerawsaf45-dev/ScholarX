"use client";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function TreeStageVisual({ stage }: { stage: string }) {
  const getStageSvg = () => {
    switch (stage) {
      case "SEED":
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 150 Q 100 135 160 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <circle cx="100" cy="140" r="10" fill="currentColor" className="animate-pulse" />
            <path d="M 100 130 C 100 120 102 115 105 110" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </svg>
        );
      case "SPROUT":
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 150 Q 100 135 160 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <path d="M 100 145 C 98 120 102 90 110 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M 110 70 C 120 70 125 78 122 85 C 115 88 110 82 110 70" fill="var(--secondary)" />
            <path d="M 105 90 C 92 88 88 95 90 102 C 98 102 102 96 105 90" fill="currentColor" />
          </svg>
        );
      case "SAPLING":
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 150 Q 100 135 160 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <path d="M 100 148 C 100 120 95 90 100 60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M 98 100 C 85 90 70 85 60 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 100 85 C 115 75 130 70 140 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="55" r="14" fill="var(--secondary)" opacity="0.9" />
            <circle cx="60" cy="90" r="10" fill="currentColor" opacity="0.8" />
            <circle cx="140" cy="75" r="12" fill="var(--secondary)" opacity="0.8" />
          </svg>
        );
      case "GROWING_TREE":
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 160 Q 100 145 160 160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <path d="M 100 158 C 100 115 90 85 105 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path d="M 98 110 C 75 95 55 90 40 100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M 102 95 C 125 80 145 75 160 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="105" cy="42" r="22" fill="var(--secondary)" />
            <circle cx="40" cy="100" r="16" fill="currentColor" opacity="0.9" />
            <circle cx="160" cy="85" r="18" fill="var(--secondary)" opacity="0.9" />
            <circle cx="80" cy="70" r="20" fill="currentColor" opacity="0.8" />
            <circle cx="130" cy="60" r="20" fill="var(--secondary)" opacity="0.8" />
          </svg>
        );
      case "SCHOLARSHIP_TREE":
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 30 160 Q 100 145 170 160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <path d="M 100 158 C 100 115 90 75 102 45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            <path d="M 96 105 C 70 90 45 85 30 95" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M 104 90 C 130 75 155 70 170 80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <circle cx="102" cy="35" r="26" fill="var(--secondary)" />
            <circle cx="30" cy="95" r="18" fill="currentColor" opacity="0.9" />
            <circle cx="170" cy="80" r="20" fill="var(--secondary)" opacity="0.9" />
            <circle cx="70" cy="60" r="24" fill="currentColor" opacity="0.85" />
            <circle cx="135" cy="50" r="24" fill="var(--secondary)" opacity="0.85" />
            <polygon points="102,15 105,22 112,22 107,26 109,33 102,29 95,33 97,26 92,22 99,22" fill="#FBBF24" className="animate-pulse" />
            <polygon points="65,45 67,50 72,50 68,53 69,58 65,55 61,58 62,53 58,50 63,50" fill="#FBBF24" />
            <polygon points="135,35 137,40 142,40 138,43 139,48 135,45 131,48 132,43 128,40 133,40" fill="#FBBF24" />
          </svg>
        );
      case "LEGACY_FOREST":
      default:
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 160 Q 100 150 180 160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <g opacity="0.6">
              <path d="M 60 158 V 100" stroke="currentColor" strokeWidth="4" />
              <circle cx="60" cy="90" r="18" fill="currentColor" />
            </g>
            <g opacity="0.7">
              <path d="M 140 158 V 95" stroke="currentColor" strokeWidth="5" />
              <circle cx="140" cy="80" r="20" fill="var(--secondary)" />
            </g>
            <path d="M 100 158 V 70" stroke="currentColor" strokeWidth="7" />
            <circle cx="100" cy="55" r="26" fill="var(--secondary)" />
            <circle cx="50" cy="40" r="1.5" fill="#fff" opacity="0.8" className="animate-ping" />
            <circle cx="150" cy="30" r="1.5" fill="#fff" opacity="0.8" />
            <circle cx="100" cy="20" r="2" fill="#FBBF24" className="animate-pulse" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative min-h-[300px]">
      <div className="relative flex items-center justify-center bg-card/40 backdrop-blur-md border border-border/50 rounded-full w-56 h-56 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-full blur-xl" />
        {getStageSvg()}
      </div>
    </div>
  );
}

export function ScholarshipTreeWidget() {
  const { data, isLoading, isError } = useDashboardData();
  const progress = data?.userProgress;

  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardContent className="h-full flex items-center justify-center p-0">
          <Skeleton className="w-full h-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !progress) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Failed to load tree data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[400px] lg:min-h-[500px] overflow-hidden relative group">
      <CardContent className="p-0 h-full relative bg-gradient-to-b from-primary/5 to-background flex flex-col justify-between">
        
        {/* Overlay UI - Title */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 pb-0 z-10 pointer-events-none"
        >
          <h3 className="font-heading font-bold text-2xl tracking-tight">Your Journey</h3>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            Stage: <span className="text-primary font-semibold uppercase">{progress.growthStage.replace("_", " ")}</span>
          </p>
        </motion.div>

        {/* Dynamic Vector Tree stage visualization */}
        <div className="flex-1 flex items-center justify-center">
          <TreeStageVisual stage={progress.growthStage} />
        </div>

        {/* Overlay UI - Progress Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 pt-0 z-10 flex justify-center pointer-events-none"
        >
          <div className="bg-background/85 backdrop-blur-md px-6 py-2 rounded-full border border-border shadow-sm flex items-center gap-3 w-fit">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress.growthPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
            <span className="font-bold text-sm">{progress.growthPercent}% to Next Level</span>
          </div>
        </motion.div>

      </CardContent>
    </Card>
  );
}
