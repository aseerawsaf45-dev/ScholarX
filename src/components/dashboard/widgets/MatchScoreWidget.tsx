"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import gsap from "gsap";

const MOCK_MATCH_DATA = {
  score: 87,
  breakdown: {
    gpa: 90,
    ielts: 100,
    field: 85,
    country: 75,
  }
};

export function MatchScoreWidget() {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (scoreRef.current) {
      gsap.to(scoreRef.current, {
        innerHTML: MOCK_MATCH_DATA.score,
        duration: 2,
        snap: { innerHTML: 1 },
        ease: "power2.out",
      });
    }

    barsRef.current.forEach((bar, index) => {
      if (bar) {
        const values = Object.values(MOCK_MATCH_DATA.breakdown);
        gsap.to(bar, {
          width: `${values[index]}%`,
          duration: 1.5,
          delay: 0.5 + index * 0.1,
          ease: "power3.out"
        });
      }
    });
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          Latest Match Score
          <Icon name="PieChart" size={16} className="text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-4xl font-heading font-bold text-primary">
            <span ref={scoreRef}>0</span>%
          </span>
          <div className="text-right">
            <p className="text-sm font-medium">Top Match</p>
            <p className="text-xs text-muted-foreground">Fulbright 2027</p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(MOCK_MATCH_DATA.breakdown).map(([key, _value], index) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="uppercase text-muted-foreground font-medium">{key}</span>
                <span className="font-medium">{_value}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  ref={el => { barsRef.current[index] = el }}
                  className="h-full bg-primary w-0" 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
