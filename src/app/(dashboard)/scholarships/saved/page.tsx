"use client";

import { useQuery } from "@tanstack/react-query";
import { ScholarshipCard } from "@/components/scholarships/explorer/ScholarshipCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SavedScholarshipsPage() {
  const { data: savedScholarships, isLoading, isError } = useQuery<any[]>({
    queryKey: ["savedScholarships"],
    queryFn: async () => {
      const res = await fetch("/api/scholarships/save");
      if (!res.ok) throw new Error("Failed to fetch saved scholarships");
      return res.json();
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Saved Scholarships</h1>
          <p className="text-muted-foreground mt-2">Manage your bookmarked scholarships and track their preparation.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <Icon name="ArrowLeft" className="mr-2" size={16} /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Icon name="AlertCircle" size={48} className="mb-4 text-destructive/50" />
          <p>Failed to load saved scholarships. Please try again later.</p>
        </div>
      ) : !savedScholarships || savedScholarships.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Icon name="Bookmark" size={48} className="text-muted-foreground opacity-55 mb-4" />
          <h3 className="font-semibold text-lg">No saved scholarships</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-6">
            Browse and search for scholarships to save them to your list.
          </p>
          <Button asChild>
            <Link href="/scholarships">Explore Scholarships</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedScholarships.map((scholarship) => (
            <ScholarshipCard 
              key={scholarship.id} 
              scholarship={scholarship} 
              isSaved={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
