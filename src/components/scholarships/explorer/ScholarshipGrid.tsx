"use client";

import { useScholarshipSearch } from "@/hooks/useScholarships";
import { ScholarshipCard } from "./ScholarshipCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { useQuery } from "@tanstack/react-query";

export function ScholarshipGrid() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useScholarshipSearch();

  const { data: savedData } = useQuery<any[]>({
    queryKey: ["savedScholarships"],
    queryFn: async () => {
      const res = await fetch("/api/scholarships/save");
      if (!res.ok) throw new Error("Failed to fetch saved scholarships");
      return res.json();
    }
  });

  const savedIds = new Set(savedData?.map(s => s.id) || []);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Icon name="AlertCircle" size={48} className="mb-4 text-destructive/50" />
        <p>Failed to load scholarships. Please try again later.</p>
      </div>
    );
  }

  const scholarships = data?.pages.flatMap(page => page.scholarships) || [];

  if (scholarships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Icon name="SearchX" size={48} className="mb-4 opacity-50" />
        <p className="font-medium text-foreground">No scholarships found</p>
        <p className="text-sm">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((scholarship) => (
          <ScholarshipCard 
            key={scholarship.id} 
            scholarship={scholarship} 
            isSaved={savedIds.has(scholarship.id)}
          />
        ))}
      </div>
      
      {/* Infinite Scroll trigger area */}
      <div ref={ref} className="w-full flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Loader2" className="animate-spin" size={16} />
            <span className="text-sm">Loading more...</span>
          </div>
        ) : hasNextPage ? (
          <div className="h-4" /> // Invisible trigger
        ) : (
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end of the results.</p>
        )}
      </div>
    </div>
  );
}
