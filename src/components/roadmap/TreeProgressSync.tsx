"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";

// This component can be integrated with @splinetool/react-spline 
// For now we simulate the tree stages with UI elements and Framer Motion.

export function TreeProgressSync({ percent, stage }: { percent: number; stage: string }) {
  
  const getStageVisual = () => {
    switch (stage) {
      case "SEED": return { color: "text-amber-700", bg: "bg-amber-900/20", icon: "bean", label: "Seed" };
      case "SPROUT": return { color: "text-emerald-500", bg: "bg-emerald-500/20", icon: "leaf", label: "Sprout" };
      case "SAPLING": return { color: "text-emerald-400", bg: "bg-emerald-400/20", icon: "trees", label: "Sapling" };
      case "GROWING_TREE": return { color: "text-green-400", bg: "bg-green-400/20", icon: "tree-pine", label: "Growing Tree" };
      case "SCHOLARSHIP_TREE": return { color: "text-primary-400", bg: "bg-primary-500/20", icon: "tree-deciduous", label: "Scholarship Tree" };
      case "LEGACY_FOREST": return { color: "text-purple-400", bg: "bg-purple-500/20", icon: "tent-tree", label: "Legacy Forest" };
      default: return { color: "text-slate-400", bg: "bg-slate-500/20", icon: "help-circle", label: "Unknown" };
    }
  };

  const visual = getStageVisual();

  return (
    <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className={`w-16 h-16 rounded-2xl ${visual.bg} flex items-center justify-center`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Icon name={visual.icon as any} className={`w-8 h-8 ${visual.color}`} />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Growth Stage</h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-2xl font-bold ${visual.color}`}
            >
              {visual.label}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="text-right">
          <span className="text-3xl font-bold text-foreground">{percent}</span>
          <span className="text-muted-foreground text-sm">/100 XP</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
          <span>Seed</span>
          <span>Forest</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 w-full h-full animate-pulse" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
