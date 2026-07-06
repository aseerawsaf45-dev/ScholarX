"use client";

import { Scholarship } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { useSavedScholarshipsStore } from "@/store/savedScholarshipsStore";

interface ScholarshipCardProps {
  scholarship: Partial<Scholarship>;
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const { isSaved, toggleSaved } = useSavedScholarshipsStore();
  const matchScore = Math.floor(Math.random() * 40) + 60; // Mocked match score for now
  const saved = isSaved(String(scholarship.id));

  let scoreColor = "text-green-500 bg-green-500/10";
  if (matchScore < 60) scoreColor = "text-red-500 bg-red-500/10";
  else if (matchScore < 90) scoreColor = "text-yellow-500 bg-yellow-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      {/* Glassmorphism background effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />

      <Card className="h-full border-border/50 bg-background/60 backdrop-blur-md hover:bg-background/80 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        <CardContent className="p-6 flex flex-col h-full relative">
            
            {/* Top Row: Badges */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                  {scholarship.fundingType?.replace(/_/g, " ")}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                  {scholarship.degreeLevel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md ${scoreColor}`}>
                  <Icon name="Target" size={12} />
                  <span className="text-xs font-bold">{matchScore}% Match</span>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleSaved({
                      id: String(scholarship.id),
                      title: scholarship.title ?? "Scholarship",
                      provider: scholarship.provider,
                      slug: scholarship.slug,
                    });
                  }}
                  className={`rounded-full p-2 transition-colors ${saved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                  aria-label={saved ? "Unsave scholarship" : "Save scholarship"}
                >
                  <Icon name={saved ? "BookmarkCheck" : "Bookmark"} size={14} />
                </button>
              </div>
            </div>

            {/* Title & Provider */}
            <div className="mb-4 flex-1">
              <h3 className="font-heading font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                {scholarship.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {scholarship.university || scholarship.provider}
              </p>
            </div>

            {/* Snapshot */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="MapPin" size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">{scholarship.country}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Calendar" size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">
                  {scholarship.deadline ? format(new Date(scholarship.deadline), "MMM d, yyyy") : "Varies"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="GraduationCap" size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">Min GPA: {scholarship.requiredGPA || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="FileText" size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">IELTS: {scholarship.requiredIELTS || "N/A"}</span>
              </div>
            </div>

            <Link href={`/scholarships/${scholarship.slug}`} className="mt-auto">
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                <span>View details</span>
                <Icon name="ArrowRight" size={14} />
              </div>
            </Link>
          </CardContent>
        </Card>
    </motion.div>
  );
}
