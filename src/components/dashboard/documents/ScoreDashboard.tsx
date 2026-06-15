"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

interface CategoryScores {
  clarity: number;
  grammar: number;
  structure: number;
  impact: number;
  relevance: number;
}

export function ScoreDashboard({ 
  overallScore, 
  categoryScores 
}: { 
  overallScore: number;
  categoryScores: CategoryScores;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const categories = [
    { key: 'clarity', label: 'Clarity', icon: 'FileText' as const },
    { key: 'grammar', label: 'Grammar', icon: 'CheckCircle' as const },
    { key: 'structure', label: 'Structure', icon: 'Layers' as const },
    { key: 'impact', label: 'Impact', icon: 'Zap' as const },
    { key: 'relevance', label: 'Relevance', icon: 'Target' as const },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl opacity-50" />
      
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch relative z-10">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 min-w-[200px]">
          <span className="text-sm text-slate-400 mb-2 font-medium">Overall Score</span>
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="351.858"
                strokeDashoffset={351.858 - (351.858 * overallScore) / 100}
                strokeLinecap="round"
                className={getScoreColor(overallScore)}
                initial={{ strokeDashoffset: 351.858 }}
                animate={{ strokeDashoffset: 351.858 - (351.858 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-xs text-slate-500 mt-1">/100</span>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          {categories.map((cat, idx) => {
            const score = categoryScores[cat.key as keyof CategoryScores];
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <Icon name={cat.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                    <span className="text-xs text-slate-500">/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 10) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
