"use client";

import { motion } from "framer-motion";

export function ProfileCompletionMeter({ score }: { score: number }) {
  return (
    <div className="w-full bg-card border border-border p-6 rounded-2xl shadow-soft">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Profile Completion</h3>
        <span className="font-bold text-primary">{score}%</span>
      </div>
      
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        {score < 100 ? (
          <p>Complete your profile to unlock better scholarship matches.</p>
        ) : (
          <p>Your profile is fully complete! You're ready to find scholarships.</p>
        )}
      </div>
    </div>
  );
}
