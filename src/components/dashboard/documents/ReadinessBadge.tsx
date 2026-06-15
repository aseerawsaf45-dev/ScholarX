"use client";

import { motion } from "framer-motion";

export function ReadinessBadge({ status }: { status: "LOW" | "MEDIUM" | "HIGH" }) {
  const colors = {
    LOW: "bg-red-500/10 text-red-500 border-red-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    HIGH: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-1.5 rounded-full border font-semibold text-sm tracking-wide ${colors[status]}`}
    >
      Readiness: {status}
    </motion.div>
  );
}
