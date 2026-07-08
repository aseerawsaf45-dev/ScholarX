"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const AVAILABLE_SUBJECTS = [
  "Computer Science", "Engineering", "Business", "Medicine", 
  "Architecture", "Arts", "Data Science", "Law", "Public Health", "Environmental Science"
];

const AVAILABLE_COUNTRIES = [
  "Germany", "Canada", "USA", "UK", "Australia", 
  "Sweden", "Netherlands", "Japan", "South Korea", "China"
];

const step1Schema = z.object({
  name: z.string().min(1, "Name is required"),
  educationLevel: z.string().min(1, "Required"),
  hscGpa: z.string().optional(),
  undergraduateCgpa: z.string().optional(),
  institutionName: z.string().optional(),
});

const step2Schema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  familyIncome: z.string().optional(),
});

const step3Schema = z.object({
  ielts: z.string().optional(),
  toefl: z.string().optional(),
  duolingo: z.string().optional(),
  sat: z.string().optional(),
  gre: z.string().optional(),
});

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: formData, updateData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile", { credentials: 'include' });
        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          if (data?.profile) {
            const p = data.profile;
            const existingData = {
              name: p.name || "",
              email: p.email || "",
              educationLevel: p.profile?.educationLevel || "",
              institutionName: p.profile?.institutionName || "",
              hscGpa: p.profile?.hscGpa?.toString() || "",
              country: p.profile?.country || "Bangladesh",
              city: p.profile?.city || "",
              familyIncome: p.profile?.familyIncome || "",
              ielts: p.testScores?.ielts?.toString() || "",
              toefl: p.testScores?.toefl?.toString() || "",
              duolingo: p.testScores?.duolingo?.toString() || "",
              sat: p.testScores?.sat?.toString() || "",
              gre: p.testScores?.gre?.toString() || "",
              interests: p.interests?.map((i: any) => i.field) || [],
              countries: p.countryPreferences?.map((c: any) => c.country) || [],
              desiredDegree: p.careerGoal?.desiredDegree || "",
              longTermGoal: p.careerGoal?.longTermGoal || "",
              sscGpa: p.profile?.sscGpa?.toString() || "",
              undergraduateCgpa: p.profile?.undergraduateCgpa?.toString() || "",
              graduateCgpa: p.profile?.graduateCgpa?.toString() || "",
              currentSemester: p.profile?.currentSemester || "",
              researchExperience: p.profile?.researchExperience || "",
              publications: p.profile?.publications || "",
              projects: p.profile?.projects || "",
              leadership: p.profile?.leadership || "",
              volunteerExperience: p.profile?.volunteerExperience || "",
              workExperience: p.profile?.workExperience || "",
              programmingSkills: p.profile?.programmingSkills || "",
              awards: p.profile?.awards || "",
              preferredUniversities: p.profile?.preferredUniversities || "",
              specialCircumstances: p.profile?.specialCircumstances || "",
            };
            updateData(existingData);
          }
        } else if (res.status === 401) {
          // Before redirecting, confirm the session is truly gone using the
          // Supabase client. This prevents false redirects when cookies are
          // still propagating after a fresh login.
          const { createClient } = await import("@/utils/supabase/client");
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setIsAuthenticated(false);
            router.push('/auth/login');
          } else {
            // Session exists but /api/profile returned 401 — likely a timing
            // issue. Retry once after a short delay.
            await new Promise(r => setTimeout(r, 800));
            const retry = await fetch("/api/profile", { credentials: 'include' });
            if (retry.ok) {
              setIsAuthenticated(true);
              const retryData = await retry.json();
              if (retryData?.profile) {
                const p = retryData.profile;
                updateData({
                  name: p.name || "",
                  email: p.email || "",
                  educationLevel: p.profile?.educationLevel || "",
                });
              }
            } else {
              setIsAuthenticated(false);
              router.push('/auth/login');
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
        // Network error — don't redirect, let the user see the form
        setIsAuthenticated(null);
      }
    }
    loadProfile();
  }, [updateData, router]);

  const mutation = useMutation({
    mutationFn: async (stepData: { step: number; data: any }) => {
      const supabase = createClient();
      
      if (stepData.step === 1 && stepData.data.name) {
        await supabase.auth.updateUser({
          data: {
            first_name: stepData.data.name.split(' ')[0],
            last_name: stepData.data.name.split(' ').slice(1).join(' '),
          }
        });
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: stepData.step,
          data: stepData.data
        }),
      });

      if (!res.ok) {
        let body: any = null;
        try {
          body = await res.json();
        } catch (e) {}
        const message = body?.error || (body?.message ?? "Failed to save");
        throw new Error(message || `Failed to save (status: ${res.status})`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      console.error("Onboarding save error:", error);
      const msg = error?.message || "Failed to save progress";
      toast.error(msg);
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isAuthenticated === false) return;
      if (Object.keys(formData).length > 0) {
        mutation.mutate({ step, data: formData });
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [formData, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = async () => {
    try {
      if (step === 1) step1Schema.parse(formData);
      if (step === 2) step2Schema.parse(formData);
      if (step === 3) step3Schema.parse(formData);
      setErrors({});
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.issues.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors before continuing");
        return;
      }
    }

    if (step < 7) {
      mutation.mutate({ step, data: formData });
      setStep(s => s + 1);
    } else {
      mutation.mutate({ step, data: formData }, {
        onSuccess: () => {
          toast.success("Onboarding complete!");
          router.push('/dashboard');
        }
      });
    }
  };

  const handleToggleInterest = (field: string) => {
    const current = (formData.interests as string[]) || [];
    if (current.includes(field)) {
      updateData({ interests: current.filter(x => x !== field) });
    } else {
      updateData({ interests: [...current, field] });
    }
  };

  const handleToggleCountry = (country: string) => {
    const current = (formData.countries as string[]) || [];
    if (current.includes(country)) {
      updateData({ countries: current.filter(x => x !== country) });
    } else {
      updateData({ countries: [...current, country] });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-8 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 1: Profile & Academic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input value={(formData.name as string) || ""} onChange={(e) => updateData({ name: e.target.value })} placeholder="Full Name" />
                  <p className="text-xs text-muted-foreground mt-1">Example: John Doe</p>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Education Level</label>
                  <select 
                    className="w-full h-11 px-3 mt-1 rounded-md border border-input bg-background"
                    value={(formData.educationLevel as string) || ""}
                    onChange={(e) => updateData({ educationLevel: e.target.value })}
                  >
                    <option value="">Select Level</option>
                    <option value="HSC">HSC Student</option>
                    <option value="A-Level">A-Level</option>
                    <option value="University">University</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Example: HSC Student</p>
                  {errors.educationLevel && <p className="text-xs text-destructive">{errors.educationLevel}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Institution Name</label>
                  <Input value={(formData.institutionName as string) || ""} onChange={(e) => updateData({ institutionName: e.target.value })} placeholder="e.g. Notre Dame College" />
                  <p className="text-xs text-muted-foreground mt-1">Example: Notre Dame College</p>
                </div>
                {((formData.educationLevel as string) === "University") ? (
                  <div>
                    <label className="text-sm font-medium">University CGPA</label>
                    <Input type="number" step="0.01" value={(formData.undergraduateCgpa as string) || ""} onChange={(e) => updateData({ undergraduateCgpa: e.target.value })} placeholder="e.g. 3.80" />
                    <p className="text-xs text-muted-foreground mt-1">Range: 0.00 - 4.00 | Example: 3.50</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium">GPA</label>
                    <Input type="number" step="0.01" value={(formData.hscGpa as string) || ""} onChange={(e) => updateData({ hscGpa: e.target.value })} placeholder="e.g. 5.00" />
                    <p className="text-xs text-muted-foreground mt-1">Range: 0.00 - 5.00 | Example: 4.80</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 2: Background Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input value={(formData.country as string) || "Bangladesh"} onChange={(e) => updateData({ country: e.target.value })} placeholder="e.g. Bangladesh" />
                  <p className="text-xs text-muted-foreground mt-1">Example: Bangladesh</p>
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input value={(formData.city as string) || ""} onChange={(e) => updateData({ city: e.target.value })} placeholder="e.g. Dhaka" />
                  <p className="text-xs text-muted-foreground mt-1">Example: Dhaka</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Financial Background</label>
                  <select 
                    className="w-full h-11 px-3 mt-1 rounded-md border border-input bg-background"
                    value={(formData.familyIncome as string) || ""}
                    onChange={(e) => updateData({ familyIncome: e.target.value })}
                  >
                    <option value="">Select Support Needed</option>
                    <option value="High">High support needed</option>
                    <option value="Medium">Medium support needed</option>
                    <option value="Low">Low support needed</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Example: High support needed</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 3: Test Scores</h2>
              <div className="space-y-4 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-muted-foreground text-sm mb-4">Leave blank if not taken yet.</p>
                </div>
                <div>
                  <label className="text-sm font-medium">IELTS</label>
                  <Input type="number" step="0.5" value={(formData.ielts as string) || ""} onChange={(e) => updateData({ ielts: e.target.value })} placeholder="e.g. 7.5" />
                  <p className="text-xs text-muted-foreground mt-1">Range: 0.0 - 9.0 | Example: 7.0</p>
                </div>
                <div>
                  <label className="text-sm font-medium">TOEFL</label>
                  <Input type="number" value={(formData.toefl as string) || ""} onChange={(e) => updateData({ toefl: e.target.value })} placeholder="e.g. 100" />
                  <p className="text-xs text-muted-foreground mt-1">Range: 0 - 120 | Example: 95</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duolingo</label>
                  <Input type="number" value={(formData.duolingo as string) || ""} onChange={(e) => updateData({ duolingo: e.target.value })} placeholder="e.g. 125" />
                  <p className="text-xs text-muted-foreground mt-1">Range: 10 - 160 | Example: 120</p>
                </div>
                <div>
                  <label className="text-sm font-medium">SAT (Optional)</label>
                  <Input type="number" value={(formData.sat as string) || ""} onChange={(e) => updateData({ sat: e.target.value })} placeholder="e.g. 1450" />
                  <p className="text-xs text-muted-foreground mt-1">Range: 400 - 1600 | Example: 1400</p>
                </div>
                <div>
                  <label className="text-sm font-medium">GRE (Optional)</label>
                  <Input type="number" value={(formData.gre as string) || ""} onChange={(e) => updateData({ gre: e.target.value })} placeholder="e.g. 320" />
                  <p className="text-xs text-muted-foreground mt-1">Range: 260 - 340 | Example: 310</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 4: Academic Interests</h2>
              <p className="text-muted-foreground mb-4">Select your subjects of interest:</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SUBJECTS.map((subject) => {
                  const isSelected = ((formData.interests as string[]) || []).includes(subject);
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleToggleInterest(subject)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 5: Country Preferences</h2>
              <p className="text-muted-foreground mb-4">Where do you want to study?</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COUNTRIES.map((country) => {
                  const isSelected = ((formData.countries as string[]) || []).includes(country);
                  return (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleToggleCountry(country)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 6: Career Goals</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Short Term Goal</label>
                  <Input value={(formData.desiredDegree as string) || ""} onChange={(e) => updateData({ desiredDegree: e.target.value })} placeholder="e.g. Apply for Master's in Germany" />
                  <p className="text-xs text-muted-foreground mt-1">Example: Apply for Master's in CS for Fall 2026</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Long Term Goal</label>
                  <Input value={(formData.longTermGoal as string) || ""} onChange={(e) => updateData({ longTermGoal: e.target.value })} placeholder="e.g. Work as an AI Scientist" />
                  <p className="text-xs text-muted-foreground mt-1">Example: Become a university professor or research scientist</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-4">Step 7: Additional Profile Details</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Optional: Provide deeper academic, extracurricular, and research details to unlock more accurate matching.
              </p>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2 border-b border-border/40 pb-1">Academic Scores</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">SSC GPA</label>
                      <Input type="number" step="0.01" value={(formData.sscGpa as string) || ""} onChange={(e) => updateData({ sscGpa: e.target.value })} placeholder="e.g. 5.00" className="h-9 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">HSC GPA</label>
                      <Input type="number" step="0.01" value={(formData.hscGpa as string) || ""} onChange={(e) => updateData({ hscGpa: e.target.value })} placeholder="e.g. 5.00" className="h-9 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Master CGPA</label>
                      <Input type="number" step="0.01" value={(formData.graduateCgpa as string) || ""} onChange={(e) => updateData({ graduateCgpa: e.target.value })} placeholder="e.g. 3.90" className="h-9 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Current Semester</label>
                      <select 
                        className="w-full h-9 px-2 mt-1 rounded-md border border-input bg-background text-sm"
                        value={(formData.currentSemester as string) || ""}
                        onChange={(e) => updateData({ currentSemester: e.target.value })}
                      >
                        <option value="">Select Semester</option>
                        <option value="Not Applicable">Not Applicable</option>
                        <option value="1st Semester">1st / 2nd Semester</option>
                        <option value="3rd Semester">3rd / 4th Semester</option>
                        <option value="5th Semester">5th / 6th Semester</option>
                        <option value="7th Semester">7th / 8th Semester</option>
                        <option value="Graduate / Completed">Graduate / Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2 border-b border-border/40 pb-1">Research & Achievements</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Research Experience</label>
                      <textarea value={(formData.researchExperience as string) || ""} onChange={(e) => updateData({ researchExperience: e.target.value })} placeholder="Describe any thesis or lab work..." className="w-full min-h-[70px] p-2 mt-1 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Publications</label>
                      <textarea value={(formData.publications as string) || ""} onChange={(e) => updateData({ publications: e.target.value })} placeholder="List conferences or journal papers..." className="w-full min-h-[70px] p-2 mt-1 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2 border-b border-border/40 pb-1">Experience & Skills</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Projects</label>
                      <textarea value={(formData.projects as string) || ""} onChange={(e) => updateData({ projects: e.target.value })} placeholder="Key project details..." className="w-full min-h-[70px] p-2 mt-1 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Leadership & Volunteering</label>
                      <textarea value={(formData.leadership as string) || ""} onChange={(e) => updateData({ leadership: e.target.value })} placeholder="E.g. Club president, volunteer work..." className="w-full min-h-[70px] p-2 mt-1 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Work Experience</label>
                      <textarea value={(formData.workExperience as string) || ""} onChange={(e) => updateData({ workExperience: e.target.value })} placeholder="Internships or full-time roles..." className="w-full min-h-[70px] p-2 mt-1 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-6">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Programming Skills / Tools</label>
                    <Input value={(formData.programmingSkills as string) || ""} onChange={(e) => updateData({ programmingSkills: e.target.value })} placeholder="e.g. Python, Java" className="h-9 mt-1" />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Python", "Java", "C++", "SQL", "MATLAB", "R", "Git", "LaTeX"].map(skill => {
                        const current = (formData.programmingSkills as string) || "";
                        const items = current.split(',').map(s => s.trim()).filter(Boolean);
                        const isSelected = items.includes(skill);
                        const toggleCommaItem = () => {
                          const updated = isSelected ? items.filter(x => x !== skill) : [...items, skill];
                          updateData({ programmingSkills: updated.join(', ') });
                        };
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={toggleCommaItem}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              isSelected ? "bg-primary/20 border-primary text-primary" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Special Circumstances</label>
                    <Input value={(formData.specialCircumstances as string) || ""} onChange={(e) => updateData({ specialCircumstances: e.target.value })} placeholder="e.g. Needs full funding" className="h-9 mt-1" />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Needs Full Funding", "Study Gap", "Switching Fields", "Low Income", "First Gen Student"].map(circumstance => {
                        const current = (formData.specialCircumstances as string) || "";
                        const items = current.split(',').map(s => s.trim()).filter(Boolean);
                        const isSelected = items.includes(circumstance);
                        const toggleCommaItem = () => {
                          const updated = isSelected ? items.filter(x => x !== circumstance) : [...items, circumstance];
                          updateData({ specialCircumstances: updated.join(', ') });
                        };
                        return (
                          <button
                            key={circumstance}
                            type="button"
                            onClick={toggleCommaItem}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              isSelected ? "bg-primary/20 border-primary text-primary" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {circumstance}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Preferred Universities</label>
                    <Input value={(formData.preferredUniversities as string) || ""} onChange={(e) => updateData({ preferredUniversities: e.target.value })} placeholder="e.g. Munich TU" className="h-9 mt-1" />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Munich TU", "Heidelberg Uni", "Uni of Toronto", "Oxford Uni", "MIT", "Stanford"].map(uni => {
                        const current = (formData.preferredUniversities as string) || "";
                        const items = current.split(',').map(s => s.trim()).filter(Boolean);
                        const isSelected = items.includes(uni);
                        const toggleCommaItem = () => {
                          const updated = isSelected ? items.filter(x => x !== uni) : [...items, uni];
                          updateData({ preferredUniversities: updated.join(', ') });
                        };
                        return (
                          <button
                            key={uni}
                            type="button"
                            onClick={toggleCommaItem}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              isSelected ? "bg-primary/20 border-primary text-primary" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {uni}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Awards & Achievements</label>
                    <Input value={(formData.awards as string) || ""} onChange={(e) => updateData({ awards: e.target.value })} placeholder="e.g. National Hackathon Runner Up" className="h-9 mt-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
          ) : isAuthenticated ? (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <Icon name="ArrowLeft" size={16} className="mr-2" /> Back to Dashboard
              </Link>
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button onClick={handleNext} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? "Saving..." : step === 7 ? "Complete Setup" : "Continue"}
            {!mutation.isPending && step < 7 && <Icon name="ArrowRight" size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
