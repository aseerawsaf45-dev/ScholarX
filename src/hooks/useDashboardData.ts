import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUserProgress, 
  getRoadmapTasks, 
  toggleTaskStatus, 
  getNotifications, 
  markNotificationRead,
  getRecentActivity,
  getUpcomingDeadlines,
  getDashboardData
} from "@/app/actions/dashboard";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => getDashboardData(),
  });
}

export function useUserProgress() {
  return useQuery({
    queryKey: ["userProgress"],
    queryFn: () => getUserProgress(),
  });
}

export function useRoadmapTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["roadmapTasks"],
    queryFn: () => getRoadmapTasks(),
  });

  const mutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => toggleTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapTasks"] });
      queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  return { ...query, toggleTask: mutation.mutate, isToggling: mutation.isPending };
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });

  const mutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  return { ...query, markAsRead: mutation.mutate };
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recentActivity"],
    queryFn: () => getRecentActivity(),
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ["upcomingDeadlines"],
    queryFn: () => getUpcomingDeadlines(),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => toggleTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["roadmapTasks"] });
      queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
}
