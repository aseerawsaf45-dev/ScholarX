"use client";

import { useSaveScholarship } from "@/hooks/useScholarships";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";

export function SaveButton({ 
  scholarshipId, 
  size = "lg", 
  className 
}: { 
  scholarshipId: string; 
  size?: "default" | "sm" | "lg" | "icon"; 
  className?: string;
}) {
  const saveMutation = useSaveScholarship();

  const { data: savedData } = useQuery<any[]>({
    queryKey: ["savedScholarships"],
    queryFn: async () => {
      const res = await fetch("/api/scholarships/save");
      if (!res.ok) throw new Error("Failed to fetch saved scholarships");
      return res.json();
    }
  });

  const isSaved = savedData?.some(s => s.id === scholarshipId) || false;

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(scholarshipId);
      toast.success(isSaved ? "Scholarship removed from saved list" : "Scholarship saved successfully!");
    } catch (err) {
      toast.error("Failed to update saved status");
    }
  };

  return (
    <Button 
      size={size} 
      variant="outline" 
      onClick={handleSave}
      className={className}
    >
      <Icon name={isSaved ? "Bookmark" : "BookmarkPlus"} size={16} className="mr-2" />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
