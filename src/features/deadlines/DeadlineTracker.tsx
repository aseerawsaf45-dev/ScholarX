"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeadlines, DeadlineData } from "@/hooks/useDeadlines";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

function LiveCountdown({ targetDate, isUrgent }: { targetDate: string; isUrgent: boolean }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const end = new Date(targetDate).getTime();
    
    const update = () => {
      const now = Date.now();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return <span className="text-slate-500">Calculating...</span>;

  const isCritical = timeLeft.d === 0 && timeLeft.h < 24;

  return (
    <div className={`flex gap-2 font-mono text-sm ${isUrgent ? 'text-red-400' : 'text-slate-300'}`}>
      <span className={isCritical ? 'animate-pulse text-red-500 font-bold' : ''}>
        {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
      </span>
    </div>
  );
}

export function DeadlineTracker() {
  const { deadlines, isLoading, syncDeadlines, isSyncing } = useDeadlines();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [filter, setFilter] = useState<"ALL" | "URGENT" | "UPCOMING">("ALL");

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 flex items-center justify-center">
        <Icon name="loader" className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "URGENT": return "bg-red-500/10 border-red-500/30 text-red-400";
      case "HIGH": return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "MEDIUM": return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "LOW": return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "MISSED": return "bg-slate-800 border-slate-700 text-slate-500";
      default: return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  const getUrgencyGlow = (level: string) => {
    if (level === "URGENT") return "shadow-[0_0_15px_rgba(239,68,68,0.15)]";
    return "";
  };

  const filtered = deadlines.filter(d => {
    if (filter === "ALL") return true;
    if (filter === "URGENT") return d.urgencyLevel === "URGENT";
    if (filter === "UPCOMING") return d.urgencyLevel === "HIGH" || d.urgencyLevel === "MEDIUM";
    return true;
  });

  return (
    <div className="bg-[#0B1120] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Icon name="calendar" className="w-5 h-5 text-primary-500" />
            Deadline Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">Smart sorting based on urgency & match score</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Deadlines</option>
            <option value="URGENT">Urgent (&lt; 7 days)</option>
            <option value="UPCOMING">Upcoming</option>
          </select>

          {/* Sync */}
          <button 
            onClick={() => syncDeadlines()}
            disabled={isSyncing}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-primary-400 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name={isSyncing ? "loader" : "refresh-cw"} className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
        {deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-3 py-8">
            <Icon name="calendar-off" className="w-10 h-10 opacity-50" />
            <p>No deadlines mapped yet.</p>
            <button onClick={() => syncDeadlines()} className="text-primary-400 text-sm font-medium hover:underline">
              Sync from Saved Scholarships
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-xl border transition-all ${getUrgencyColor(item.urgencyLevel)} ${getUrgencyGlow(item.urgencyLevel)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-black/20`}>
                          {item.urgencyLevel}
                        </span>
                        {item.scholarship.country && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Icon name="map-pin" className="w-3 h-3" /> {item.scholarship.country}
                          </span>
                        )}
                      </div>
                      
                      <Link href={`/scholarships/${item.scholarship.slug}`} className="font-semibold text-slate-100 hover:text-primary-400 transition-colors block mb-1">
                        {item.scholarship.title}
                      </Link>
                      <p className="text-sm opacity-80">{item.deadline.title}</p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="mb-2">
                        {item.urgencyLevel !== "MISSED" ? (
                          <LiveCountdown 
                            targetDate={item.deadline.deadlineDate} 
                            isUrgent={item.urgencyLevel === "URGENT"} 
                          />
                        ) : (
                          <span className="text-sm font-mono text-red-500 font-bold">MISSED</span>
                        )}
                      </div>
                      <div className="text-xs opacity-70">
                        {new Date(item.deadline.deadlineDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 bg-black/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${item.progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium opacity-80">{item.progressPercent}%</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">No deadlines match the current filter.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
