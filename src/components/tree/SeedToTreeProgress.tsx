"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icon";

export type GrowthStage = "seed" | "sprout" | "sapling" | "growingTree" | "scholarshipTree" | "legacyForest";

const stages: { id: GrowthStage; label: string; icon: IconName }[] = [
  { id: "seed", label: "Seed", icon: "CircleDot" }, 
  { id: "sprout", label: "Sprout", icon: "Leaf" },
  { id: "sapling", label: "Sapling", icon: "TreeDeciduous" },
  { id: "growingTree", label: "Growing Tree", icon: "TreePine" },
  { id: "scholarshipTree", label: "Scholarship Tree", icon: "Award" },
  { id: "legacyForest", label: "Legacy Forest", icon: "Globe" },
];

export function SeedToTreeProgress({ currentStage }: { currentStage: GrowthStage }) {
  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <div className="w-full py-10">
      <div className="flex justify-between items-center relative px-6">
        {/* Progress bar background */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full z-0" />
        
        {/* Active progress bar */}
        <motion.div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0"
          initial={{ width: 0 }}
          animate={{ width: `calc(${(currentIndex / (stages.length - 1)) * 100}% - 3rem)` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {stages.map((stage, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isActive ? "var(--primary)" : "var(--card)",
                  borderColor: isActive ? "var(--primary)" : "var(--border)",
                  color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  scale: isCurrent ? 1.15 : 1,
                }}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shadow-sm",
                  isActive ? "bg-primary border-primary text-primary-foreground shadow-medium" : "bg-card border-border text-muted-foreground"
                )}
              >
                <Icon name={stage.icon} size={20} />
              </motion.div>
              <span className={cn(
                "text-xs font-medium absolute -bottom-8 whitespace-nowrap transition-colors duration-300",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
