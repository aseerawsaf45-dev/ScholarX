"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type DeadlineData = {
  id: string;
  scholarshipId: string;
  deadlineId: string;
  status: "UPCOMING" | "IN_PROGRESS" | "SUBMITTED" | "MISSED" | "COMPLETED";
  progressPercent: number;
  daysRemaining: number;
  urgencyLevel: "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "MISSED";
  dynamicScore: number;
  scholarship: {
    title: string;
    country?: string;
    fundingType?: string;
    slug: string;
  };
  deadline: {
    title: string;
    deadlineDate: string;
    description?: string;
  };
};

export function useDeadlines() {
  const queryClient = useQueryClient();

  const { data: deadlines = [], isLoading, isError, refetch } = useQuery<DeadlineData[]>({
    queryKey: ["deadlines"],
    queryFn: async () => {
      const res = await fetch("/api/deadlines");
      if (!res.ok) throw new Error("Failed to fetch deadlines");
      return res.json();
    },
    refetchInterval: 1000 * 60 * 5, // Polling fallback every 5 minutes
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/deadlines", { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync deadlines");
      return res.json();
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["deadlines"], newData);
    },
  });

  return {
    deadlines,
    isLoading,
    isError,
    syncDeadlines: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    refetch
  };
}
