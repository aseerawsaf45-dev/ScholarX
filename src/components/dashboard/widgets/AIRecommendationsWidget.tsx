"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const MOCK_AI_REC = {
  scholarship: "Eiffel Excellence Scholarship",
  provider: "French Ministry for Europe and Foreign Affairs",
  reasoning: "Your strong IELTS score (8.0) and academic background in Engineering aligns perfectly with their priority STEM fields.",
  match: 92
};

const MATCH_FACTORS = [
  { name: "Academic GPA", detail: "Your CGPA meets the minimum requirements" },
  { name: "Language Test", detail: "IELTS score exceeds the 7.5 requirement" },
  { name: "Field of Study", detail: "Engineering aligns with STEM priorities" }
];

export function AIRecommendationsWidget() {
  const router = useRouter();
  const matchScore = MOCK_AI_REC.match;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * matchScore) / 100;

  return (
    <Card className="h-full flex flex-col bg-primary/5 border-primary/20 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-primary flex items-center justify-between">
          AI Suggestion
          <Icon name="Sparkles" size={16} className="text-primary animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col md:flex-row gap-6 justify-between">
        {/* Left Side: Scholarship Information and Match Factors */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors">
                  {MOCK_AI_REC.scholarship}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{MOCK_AI_REC.provider}</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              {MOCK_AI_REC.reasoning}
            </p>
          </div>
          
          {/* Key Match Factors Grid */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Key Match Factors
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MATCH_FACTORS.map((factor, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-lg border border-border/40"
                >
                  <Icon name="CheckCircle2" size={14} className="text-green-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold leading-tight truncate">{factor.name}</p>
                    <p className="text-[9px] text-muted-foreground leading-normal mt-0.5 line-clamp-2">
                      {factor.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Side: Animated Radial Progress Gauge and CTA */}
        <div className="w-full md:w-44 shrink-0 flex flex-col justify-between items-center bg-background/40 backdrop-blur-md p-4 rounded-xl border border-border/50 gap-4">
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  className="text-primary/10"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary">{matchScore}%</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Match</span>
              </div>
            </div>
          </div>
          
          <Button
            className="w-full text-xs h-8 font-semibold shadow-sm hover:shadow"
            variant="default"
            onClick={() => router.push("/scholarships")}
          >
            Review & Apply <Icon name="ArrowRight" className="ml-1" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
