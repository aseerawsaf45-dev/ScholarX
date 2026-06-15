"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const MOCK_AI_REC = {
  scholarship: "Eiffel Excellence Scholarship",
  provider: "French Ministry for Europe and Foreign Affairs",
  reasoning: "Your strong IELTS score (8.0) and academic background in Engineering aligns perfectly with their priority STEM fields.",
  match: 92
};

export function AIRecommendationsWidget() {
  return (
    <Card className="h-full flex flex-col bg-primary/5 border-primary/20 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-primary flex items-center justify-between">
          AI Suggestion
          <Icon name="Sparkles" size={16} className="text-primary animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm leading-tight">{MOCK_AI_REC.scholarship}</h4>
            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">
              {MOCK_AI_REC.match}% Match
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
            {MOCK_AI_REC.reasoning}
          </p>
        </div>
        
        <Button className="w-full text-xs h-8" variant="default">
          Review & Apply <Icon name="ArrowRight" className="ml-1" size={14} />
        </Button>
      </CardContent>
    </Card>
  );
}
