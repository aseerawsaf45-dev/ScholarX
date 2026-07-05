"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AdditionalDetailsFormProps {
  initialProfile: any;
}

export function AdditionalDetailsForm({ initialProfile }: AdditionalDetailsFormProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    sscGpa: initialProfile?.sscGpa?.toString() || "",
    hscGpa: initialProfile?.hscGpa?.toString() || "",
    undergraduateCgpa: initialProfile?.undergraduateCgpa?.toString() || "",
    graduateCgpa: initialProfile?.graduateCgpa?.toString() || "",
    currentSemester: initialProfile?.currentSemester || "",
    researchExperience: initialProfile?.researchExperience || "",
    publications: initialProfile?.publications || "",
    projects: initialProfile?.projects || "",
    leadership: initialProfile?.leadership || "",
    volunteerExperience: initialProfile?.volunteerExperience || "",
    workExperience: initialProfile?.workExperience || "",
    programmingSkills: initialProfile?.programmingSkills || "",
    awards: initialProfile?.awards || "",
    preferredUniversities: initialProfile?.preferredUniversities || "",
    specialCircumstances: initialProfile?.specialCircumstances || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save additional details");

      // Sync roadmap and deadlines with new profile info
      await Promise.allSettled([
        fetch("/api/roadmap", { method: "POST" }),
        fetch("/api/deadlines", { method: "POST" })
      ]);

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      toast.success("Additional profile details saved, and roadmap/deadlines synced successfully!");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Icon name="Sparkles" className="text-primary" size={20} />
            Additional Profile Details
          </CardTitle>
          <CardDescription>
            Provide deeper academic, extracurricular, and research details to get a more accurate alignment evaluation.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={20} />
        </Button>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="animate-in fade-in duration-300">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Academic Detail Fields */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 border-b border-border/40 pb-1">Academic Scores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">SSC GPA</label>
                  <Input type="number" step="0.01" name="sscGpa" value={formData.sscGpa} onChange={handleChange} placeholder="e.g. 5.00" className="h-9 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">HSC GPA</label>
                  <Input type="number" step="0.01" name="hscGpa" value={formData.hscGpa} onChange={handleChange} placeholder="e.g. 5.00" className="h-9 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Bachelor CGPA</label>
                  <Input type="number" step="0.01" name="undergraduateCgpa" value={formData.undergraduateCgpa} onChange={handleChange} placeholder="e.g. 3.80" className="h-9 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Master CGPA</label>
                  <Input type="number" step="0.01" name="graduateCgpa" value={formData.graduateCgpa} onChange={handleChange} placeholder="e.g. 3.90" className="h-9 mt-1" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Current Semester</label>
                  <Input name="currentSemester" value={formData.currentSemester} onChange={handleChange} placeholder="e.g. 8th" className="h-9 mt-1" />
                </div>
              </div>
            </div>

            {/* Research & Experience Fields */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 border-b border-border/40 pb-1">Research & Achievements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Research Experience</label>
                  <textarea name="researchExperience" value={formData.researchExperience} onChange={handleChange} placeholder="Describe any thesis, lab work or research assistance..." className="w-full min-h-[80px] p-2 mt-1 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Publications</label>
                  <textarea name="publications" value={formData.publications} onChange={handleChange} placeholder="List conferences, journals or publications (if any)..." className="w-full min-h-[80px] p-2 mt-1 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            </div>

            {/* Extracurricular & Skills */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 border-b border-border/40 pb-1">Experience & Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Projects</label>
                  <textarea name="projects" value={formData.projects} onChange={handleChange} placeholder="Key project details..." className="w-full min-h-[80px] p-2 mt-1 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Leadership & Volunteering</label>
                  <textarea name="leadership" value={formData.leadership} onChange={handleChange} placeholder="E.g. Club president, volunteer work..." className="w-full min-h-[80px] p-2 mt-1 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Work Experience</label>
                  <textarea name="workExperience" value={formData.workExperience} onChange={handleChange} placeholder="Internships or full-time roles..." className="w-full min-h-[80px] p-2 mt-1 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            </div>

            {/* Targets & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Programming Skills / Tools</label>
                <Input name="programmingSkills" value={formData.programmingSkills} onChange={handleChange} placeholder="e.g. Python, Java, MATLAB" className="h-9 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Awards & Achievements</label>
                <Input name="awards" value={formData.awards} onChange={handleChange} placeholder="e.g. National Hackathon Runner Up" className="h-9 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Preferred Universities</label>
                <Input name="preferredUniversities" value={formData.preferredUniversities} onChange={handleChange} placeholder="e.g. Munich TU, Heidelberg" className="h-9 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Special Circumstances</label>
                <Input name="specialCircumstances" value={formData.specialCircumstances} onChange={handleChange} placeholder="e.g. Needs full funding, study gaps..." className="h-9 mt-1" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" variant="premium" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
