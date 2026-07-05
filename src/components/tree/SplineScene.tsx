"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SplineSceneProps {
  scene?: string;
  className?: string;
  onLoad?: () => void;
}

export function SplineScene({ className }: SplineSceneProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center relative overflow-hidden bg-background/50 backdrop-blur-sm", className)}>
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      
      {/* Elegant SVG Vector tree */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[360px] aspect-square flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="treeTrunk" x1="200" y1="350" x2="200" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            
            <linearGradient id="leafGrad" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Ground Curve */}
          <path d="M 80 350 Q 200 330 320 350" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          
          {/* Elegant Curved Trunk */}
          <path d="M 200 350 C 200 290 190 220 205 160" stroke="url(#treeTrunk)" strokeWidth="6" strokeLinecap="round" />
          
          {/* Curved Branches */}
          <path d="M 201 230 C 180 210 145 205 125 215" stroke="url(#treeTrunk)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M 202 200 C 220 180 255 175 275 185" stroke="url(#treeTrunk)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M 205 160 C 190 120 165 95 180 65" stroke="url(#treeTrunk)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M 205 160 C 220 120 240 95 225 65" stroke="url(#treeTrunk)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

          {/* Floating Leaves / Fruits */}
          <g filter="url(#glow)">
            <circle cx="180" cy="65" r="14" fill="url(#leafGrad)" />
            <circle cx="225" cy="65" r="16" fill="url(#leafGrad)" />
            <circle cx="125" cy="215" r="12" fill="url(#leafGrad)" />
            <circle cx="275" cy="185" r="13" fill="url(#leafGrad)" />
            <circle cx="200" cy="120" r="10" fill="url(#leafGrad)" opacity="0.9" />
          </g>

          {/* Sparkles / Stars in the background */}
          <g opacity="0.6">
            <circle cx="90" cy="120" r="2" fill="var(--secondary)" />
            <circle cx="310" cy="100" r="2.5" fill="var(--primary)" />
            <circle cx="150" cy="280" r="1.5" fill="var(--primary)" />
            <circle cx="260" cy="270" r="2" fill="var(--secondary)" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
