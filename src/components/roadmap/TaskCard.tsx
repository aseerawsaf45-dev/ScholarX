"use client";

import { motion } from "framer-motion";
import { RoadmapTask } from "@/hooks/useRoadmap";
import { Icon } from "@/components/ui/icon";
import { useState } from "react";

interface TaskCardProps {
  task: RoadmapTask;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";

  const getPriorityColor = () => {
    if (task.priorityScore >= 90) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (task.priorityScore >= 70) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getCategoryColor = () => {
    switch (task.category) {
      case "ESSENTIAL": return "bg-purple-500/20 text-purple-400";
      case "HIGH_IMPACT": return "bg-emerald-500/20 text-emerald-400";
      case "OPTIONAL": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`relative p-4 rounded-xl border backdrop-blur-xl transition-all shadow-sm ${
        isCompleted 
          ? "bg-slate-900/40 border-slate-800 opacity-60" 
          : "bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className={`font-semibold text-[15px] leading-tight ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
          {task.title}
        </h3>
        {!isCompleted && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${getPriorityColor()}`}>
            {task.priorityScore} PTS
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getCategoryColor()}`}>
          {task.category.replace('_', ' ')}
        </span>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Icon name="clock" className="w-3 h-3" />
          ~{task.estimatedTimeDays} days
        </span>
        {task.linkedScholarships.length > 0 && (
          <span className="text-xs text-primary-400 flex items-center gap-1 bg-primary-500/10 px-2 py-0.5 rounded-md">
            <Icon name="link" className="w-3 h-3" />
            {task.linkedScholarships.length} linked
          </span>
        )}
      </div>

      {expanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 text-sm text-slate-400"
        >
          <p>{task.description}</p>
          
          {task.aiSuggestion && (
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex gap-2 items-start">
              <Icon name="sparkles" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs text-purple-200 leading-relaxed italic">{task.aiSuggestion}</p>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          {expanded ? "Show Less" : "Details"}
          <Icon name={expanded ? "chevron-up" : "chevron-down"} className="w-3 h-3" />
        </button>

        {!isCompleted && (
          <button
            onClick={() => onComplete(task.id)}
            className="text-xs font-medium bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm shadow-primary-500/20 flex items-center gap-1.5"
          >
            <Icon name="check" className="w-3 h-3" />
            Complete
          </button>
        )}
        {isCompleted && (
          <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md">
            <Icon name="check-circle-2" className="w-3 h-3" />
            Done
          </span>
        )}
      </div>
    </motion.div>
  );
}
