"use client";

import { useSimilarScholarships } from "@/hooks/useScholarships";
import { ScholarshipCard } from "@/components/scholarships/explorer/ScholarshipCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";

interface SimilarScholarshipsProps {
  scholarshipId: string;
}

export function SimilarScholarships({ scholarshipId }: SimilarScholarshipsProps) {
  const { data: similar, isLoading, isError } = useSimilarScholarships(scholarshipId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !similar || similar.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
        <Icon name="Inbox" size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No similar scholarships found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {similar.slice(0, 3).map((scholarship) => (
        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
      ))}
    </div>
  );
}
