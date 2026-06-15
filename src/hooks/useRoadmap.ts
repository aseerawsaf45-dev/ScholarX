"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type RoadmapTask = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "ESSENTIAL" | "HIGH_IMPACT" | "OPTIONAL";
  priorityScore: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  estimatedTimeDays: number;
  linkedScholarships: string[];
  dependencies: string[];
  impactOnTreeGrowth: number;
  aiSuggestion?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useRoadmap() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, isError, refetch } = useQuery<RoadmapTask[]>({
    queryKey: ["roadmap-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/roadmap");
      if (!res.ok) throw new Error("Failed to fetch roadmap tasks");
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/roadmap", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate roadmap");
      return res.json();
    },
    onSuccess: (newTasks) => {
      queryClient.setQueryData(["roadmap-tasks"], newTasks);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoadmapTask["status"] }) => {
      const res = await fetch(`/api/roadmap/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["roadmap-tasks"] });
      const previousTasks = queryClient.getQueryData<RoadmapTask[]>(["roadmap-tasks"]);
      
      // Optimistically update
      if (previousTasks) {
        queryClient.setQueryData<RoadmapTask[]>(
          ["roadmap-tasks"],
          previousTasks.map((t) => (t.id === id ? { ...t, status } : t))
        );
      }
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["roadmap-tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap-tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    isError,
    generateRoadmap: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    updateTaskStatus: updateStatusMutation.mutate,
    refetch,
  };
}
