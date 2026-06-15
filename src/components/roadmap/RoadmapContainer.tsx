"use client";

import { useRoadmap } from "@/hooks/useRoadmap";
import { TaskCard } from "./TaskCard";
import { Icon } from "@/components/ui/icon";
import { AnimatePresence } from "framer-motion";

export function RoadmapContainer() {
  const { tasks, isLoading, isError, generateRoadmap, isGenerating, updateTaskStatus } = useRoadmap();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
        <Icon name="loader" className="w-6 h-6 animate-spin text-primary-500" />
        Loading your personalized roadmap...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
        <Icon name="alert-triangle" className="w-8 h-8 mx-auto mb-2" />
        <p>Failed to load roadmap. Please try again later.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-400">
          <Icon name="map" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">No Roadmap Generated</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          We need to analyze your profile to build a personalized study-abroad roadmap. Click below to generate your deterministic task list.
        </p>
        <button
          onClick={() => generateRoadmap()}
          disabled={isGenerating}
          className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 mx-auto"
        >
          {isGenerating ? <Icon name="loader" className="w-5 h-5 animate-spin" /> : <Icon name="wand-2" className="w-5 h-5" />}
          {isGenerating ? "Analyzing Profile & AI..." : "Generate My Roadmap"}
        </button>
      </div>
    );
  }

  const handleComplete = (id: string) => {
    updateTaskStatus({ id, status: "COMPLETED" });
  };

  const highPriority = tasks.filter(t => t.status !== "COMPLETED" && t.priorityScore >= 80);
  const upNext = tasks.filter(t => t.status !== "COMPLETED" && t.priorityScore < 80);
  const completed = tasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Your Action Plan</h2>
          <p className="text-sm text-slate-400">{tasks.length} total tasks • {completed.length} completed</p>
        </div>
        <button
          onClick={() => generateRoadmap()}
          disabled={isGenerating}
          className="text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {isGenerating ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="refresh-cw" className="w-4 h-4" />}
          Refresh Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: High Priority */}
        <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <h3 className="font-semibold text-slate-200">High Priority</h3>
            <span className="ml-auto bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{highPriority.length}</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {highPriority.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
              {highPriority.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8 italic">No high priority tasks.</p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 2: Up Next */}
        <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="font-semibold text-slate-200">Up Next</h3>
            <span className="ml-auto bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{upNext.length}</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {upNext.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
              {upNext.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8 italic">No upcoming tasks.</p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-slate-900/10 rounded-2xl p-4 border border-slate-800/50 flex flex-col gap-4 opacity-80">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="font-semibold text-slate-200">Completed</h3>
            <span className="ml-auto bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{completed.length}</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {completed.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
              {completed.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8 italic">No completed tasks yet.</p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
