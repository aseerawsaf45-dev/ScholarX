"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { getScholarshipEligibility } from "@/app/actions/eligibility";
import type { ScholarshipEligibilityData } from "@/app/actions/eligibility";
import type { ImprovementItem } from "@/lib/scoring-engine";
import Link from "next/link";

const IMPACT_CONFIG = {
  critical: { label: "Critical", bg: "bg-red-500/10 border-red-500/20", badge: "bg-red-500 text-white", text: "text-red-500", dot: "bg-red-500", icon: "AlertCircle" },
  high: { label: "High", bg: "bg-orange-500/10 border-orange-500/20", badge: "bg-orange-500 text-white", text: "text-orange-500", dot: "bg-orange-500", icon: "TrendingUp" },
  medium: { label: "Medium", bg: "bg-yellow-500/10 border-yellow-500/20", badge: "bg-yellow-500/20 text-yellow-600", text: "text-yellow-600", dot: "bg-yellow-500", icon: "Circle" },
  low: { label: "Low", bg: "bg-muted border-border", badge: "bg-muted-foreground/20 text-muted-foreground", text: "text-muted-foreground", dot: "bg-muted-foreground", icon: "Info" },
};

const CATEGORY_ICON: Record<string, string> = {
  gpa: "GraduationCap",
  language: "Languages",
  research: "FlaskConical",
  documents: "FileText",
  extracurricular: "Users",
  field: "Compass",
  degree: "BookOpen",
};

const MATCH_RING_COLOR = {
  emerald: "text-emerald-500 [--ring:#10b981]",
  green: "text-green-500 [--ring:#22c55e]",
  yellow: "text-yellow-500 [--ring:#eab308]",
  orange: "text-orange-500 [--ring:#f97316]",
  red: "text-red-500 [--ring:#ef4444]",
  gray: "text-muted-foreground [--ring:#6b7280]",
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const ringCls = MATCH_RING_COLOR[color as keyof typeof MATCH_RING_COLOR] || MATCH_RING_COLOR.gray;

  return (
    <div className={`relative flex items-center justify-center w-28 h-28 mx-auto ${ringCls}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" opacity="0.15" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-bold leading-none">{score}%</p>
        <p className="text-[9px] font-medium uppercase tracking-wider opacity-70 mt-0.5">Match</p>
      </div>
    </div>
  );
}

function BreakdownBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground capitalize">{label}</span>
        <span className="text-[10px] font-bold">{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScholarshipMatchPanel({ scholarshipId }: { scholarshipId: string }) {
  const [data, setData] = useState<ScholarshipEligibilityData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const result = await getScholarshipEligibility(scholarshipId);
      setData(result);
    });
  }, [scholarshipId]);

  if (isPending || !data) {
    return (
      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 animate-pulse">
        <div className="h-5 bg-muted rounded w-32 mb-4" />
        <div className="w-28 h-28 rounded-full bg-muted mx-auto mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  const { eligibility, improvements, matchScore, matchLabel, matchColor } = data;
  const breakdown = eligibility?.breakdown;

  return (
    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
      <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
        <Icon name="Sparkles" size={18} />
        Your Match Score
      </h3>

      <ScoreRing score={matchScore} color={matchColor} />

      <div className="text-center">
        <span className={`text-sm font-bold ${MATCH_RING_COLOR[matchColor as keyof typeof MATCH_RING_COLOR]?.split(" ")[0]}`}>
          {matchLabel}
        </span>
        {eligibility?.category && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{eligibility.category}</p>
        )}
      </div>

      {breakdown && (
        <>
          <button
            onClick={() => setShowBreakdown(v => !v)}
            className="text-[10px] text-primary underline underline-offset-2 w-full text-center"
          >
            {showBreakdown ? "Hide" : "Show"} score breakdown
          </button>
          {showBreakdown && (
            <div className="space-y-2 pt-1">
              <BreakdownBar label="Academic GPA" score={breakdown.gpa} max={30} />
              <BreakdownBar label="Language" score={breakdown.language} max={20} />
              <BreakdownBar label="Field Match" score={breakdown.field} max={15} />
              <BreakdownBar label="Degree Level" score={breakdown.degree} max={10} />
              <BreakdownBar label="Country" score={breakdown.country} max={10} />
              <BreakdownBar label="Documents" score={breakdown.documents} max={10} />
              <BreakdownBar label="Extracurricular" score={breakdown.extracurricular} max={5} />
            </div>
          )}
        </>
      )}

      {improvements.length > 0 && (
        <div className="pt-2 border-t border-primary/10">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
            {improvements.length} gap{improvements.length > 1 ? "s" : ""} found — fix to boost score
          </p>
          <div className="space-y-1.5">
            {improvements.slice(0, 3).map((item, i) => {
              const cfg = IMPACT_CONFIG[item.impact];
              return (
                <div key={i} className="flex items-start gap-2 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                  <div>
                    <span className="font-semibold">{item.gap}</span>
                    <span className="text-muted-foreground"> · +{item.impactPoints}pts</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="#improvements">
            <Button size="sm" variant="ghost" className="mt-2 w-full h-7 text-[10px] text-primary border border-primary/20 hover:bg-primary/10">
              View full improvement plan ↓
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export function ScholarshipImprovementSection({ scholarshipId, scholarshipTitle }: { scholarshipId: string; scholarshipTitle: string }) {
  const [improvements, setImprovements] = useState<ImprovementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScholarshipEligibility(scholarshipId).then(d => {
      setImprovements(d.improvements);
      setLoading(false);
    });
  }, [scholarshipId]);

  if (loading) return (
    <section id="improvements" className="space-y-4">
      <h2 className="text-2xl font-heading font-semibold flex items-center">
        <Icon name="TrendingUp" className="mr-3 text-primary" /> How to Improve Your Chances
      </h2>
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
      </div>
    </section>
  );

  if (!improvements.length) return (
    <section id="improvements" className="space-y-4">
      <h2 className="text-2xl font-heading font-semibold flex items-center">
        <Icon name="TrendingUp" className="mr-3 text-primary" /> Your Improvement Plan
      </h2>
      <div className="flex items-center gap-3 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <Icon name="CircleCheck" size={28} className="text-emerald-500 shrink-0" />
        <div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">Strong profile for this scholarship!</p>
          <p className="text-sm text-muted-foreground mt-0.5">No critical gaps detected. Focus on polishing your SOP and securing strong recommendation letters.</p>
        </div>
      </div>
    </section>
  );

  return (
    <section id="improvements" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-semibold flex items-center">
          <Icon name="TrendingUp" className="mr-3 text-primary" /> How to Improve Your Chances
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {improvements.length} personalised action{improvements.length > 1 ? "s" : ""} ranked by impact on your match score for <strong>{scholarshipTitle}</strong>.
        </p>
      </div>

      <div className="space-y-4">
        {improvements.map((item, i) => {
          const cfg = IMPACT_CONFIG[item.impact];
          const iconName = CATEGORY_ICON[item.category] || "Lightbulb";
          return (
            <div key={i} className={`border rounded-2xl p-5 ${cfg.bg} transition-all hover:shadow-md`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.badge}`}>
                  <Icon name={iconName as any} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{item.gap}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${cfg.badge}`}>
                      {cfg.label} Impact
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">+{item.impactPoints} pts potential</span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-3 text-xs text-muted-foreground">
                    <span>Current: <strong className={`${cfg.text}`}>{item.currentValue}</strong></span>
                    <span>Target: <strong className="text-foreground">{item.targetValue}</strong></span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={10} /> {item.timeEstimate}
                    </span>
                  </div>

                  <div className="bg-background/60 rounded-xl p-3 border border-white/10">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <Icon name="Lightbulb" size={10} className="inline mr-1 text-primary" />
                      <strong className="text-foreground">Action: </strong>{item.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-3">
          <Icon name="Sparkles" size={18} className="text-primary" />
          <div>
            <p className="text-sm font-semibold">Add these to your roadmap</p>
            <p className="text-xs text-muted-foreground">Track your progress and earn EXP for each completed improvement</p>
          </div>
        </div>
        <Link href="/dashboard/roadmap">
          <Button size="sm" className="shrink-0">
            View Roadmap <Icon name="ArrowRight" size={14} className="ml-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
