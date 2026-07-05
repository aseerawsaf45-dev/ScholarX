import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useScholarshipFilterStore } from "@/store/scholarshipFilterStore";
import { Scholarship } from "@prisma/client";

interface SearchResponse {
  scholarships: Scholarship[];
  nextCursor: string | null;
}

export function useScholarshipSearch() {
  const filters = useScholarshipFilterStore();
  
  return useInfiniteQuery<SearchResponse>({
    queryKey: ["scholarships", filters],
    queryFn: async ({ pageParam = "" }) => {
      const params = new URLSearchParams();
      
      if (filters.searchQuery) params.append("search", filters.searchQuery);
      filters.countries.forEach(c => params.append("country", c));
      filters.degreeLevels.forEach(d => params.append("degreeLevel", d));
      filters.fundingTypes.forEach(f => params.append("fundingType", f));
      filters.fieldsOfStudy.forEach(f => params.append("fieldsOfStudy", f));
      
      params.append("minGpa", filters.gpaRange[0].toString());
      params.append("minIelts", filters.ieltsRange[0].toString());
      params.append("deadline", filters.deadline);
      params.append("sort", filters.sortOption);
      
      if (pageParam) params.append("cursor", pageParam as string);
      
      const res = await fetch(`/api/scholarships?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch scholarships");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: "",
  });
}

export function useScholarship(slug: string) {
  return useQuery<Scholarship>({
    queryKey: ["scholarship", slug],
    queryFn: async () => {
      const res = await fetch(`/api/scholarships/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch scholarship details");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useSimilarScholarships(id: string) {
  return useQuery<Scholarship[]>({
    queryKey: ["scholarships", "similar", id],
    queryFn: async () => {
      const res = await fetch(`/api/scholarships/similar?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch similar scholarships");
      return res.json();
    },
    enabled: !!id,
  });
}

// Assumes we have a POST /api/scholarships/save endpoint or server action
export function useSaveScholarship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scholarshipId: string) => {
      // Stub: Should call the actual server action or API route to toggle saved state
      const res = await fetch("/api/scholarships/save", {
        method: "POST",
        body: JSON.stringify({ scholarshipId }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to save scholarship");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedScholarships"] });
      // Optimistic updates can be added here if needed
    }
  });
}
