"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";

const step1Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  educationLevel: z.string().min(1, "Education level is required"),
  hscGpa: z.string().optional(),
  institutionName: z.string().optional(),
});

const step2Schema = z.object({
  country: z.string().optional(),
  district: z.string().optional(),
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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          setAuthError("You need to log in first");
          router.push("/auth/login");
          return;
        }
        if (res.ok) {
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
              district: p.profile?.district || "",
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
            };
            updateData(existingData);
          }
        } else if (res.status === 404) {
          // Profile doesn't exist yet, which is fine for first-time users
          console.log("Profile not found - new user");
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
    loadProfile();
  }, [updateData, router]);

  const mutation = useMutation({
    mutationFn: async (stepData: { step: number; data: any }) => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: stepData.step,
          data: stepData.data
        }),
      });
      
      if (res.status === 401) {
        setAuthError("Your session has expired. Please log in again.");
        router.push("/auth/login");
        throw new Error("Not authenticated");
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save (status: ${res.status})`);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Progress saved");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      if (!error.message.includes("Not authenticated")) {
        toast.error(`Failed to save: ${error.message}`);
      }
    }
  });

  const handleNext = async () => {
    // Validate current step
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

    // Save before moving to next step
    return new Promise<void>((resolve) => {
      mutation.mutate(
        { step, data: formData },
        {
          onSuccess: () => {
            if (step < 6) {
              setStep(s => s + 1);
            } else {
              toast.success("Onboarding complete!");
              router.push('/dashboard');
            }
            resolve();
          },
          onError: () => {
            // Error is already shown in onError handler
            resolve();
          }
        }
      );
    });
  };

  // Auto-save on formData changes with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Object.keys(formData).length > 0 && step > 0) {
        mutation.mutate({ step, data: formData });
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [formData, step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-soft text-center">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Authentication Error</h2>
          <p className="text-muted-foreground mb-6">{authError}</p>
          <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-8 shadow-soft relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 6) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Saving indicator */}
        {mutation.isPending && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Saving...
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 1: Profile & Academic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input 
                    value={(formData.name as string) || ""} 
                    onChange={(e) => updateData({ name: e.target.value })} 
                    placeholder="Full Name" 
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    type="email" 
                    value={(formData.email as string) || ""} 
                    onChange={(e) => updateData({ email: e.target.value })} 
                    placeholder="email@example.com" 
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Education Level *</label>
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
                  {errors.educationLevel && <p className="text-xs text-destructive">{errors.educationLevel}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Institution Name</label>
                  <Input 
                    value={(formData.institutionName as string) || ""} 
                    onChange={(e) => updateData({ institutionName: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GPA</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    max="4"
                    value={(formData.hscGpa as string) || ""} 
                    onChange={(e) => updateData({ hscGpa: e.target.value })} 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 2: Background Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input 
                    value={(formData.country as string) || "Bangladesh"} 
                    onChange={(e) => updateData({ country: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">District</label>
                  <Input 
                    value={(formData.district as string) || ""} 
                    onChange={(e) => updateData({ district: e.target.value })} 
                    placeholder="e.g., Dhaka, Chittagong" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={(formData.city as string) || ""} 
                    onChange={(e) => updateData({ city: e.target.value })} 
                  />
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
                  <Input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    max="9"
                    value={(formData.ielts as string) || ""} 
                    onChange={(e) => updateData({ ielts: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">TOEFL</label>
                  <Input 
                    type="number" 
                    min="0"
                    max="120"
                    value={(formData.toefl as string) || ""} 
                    onChange={(e) => updateData({ toefl: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duolingo</label>
                  <Input 
                    type="number" 
                    min="0"
                    max="160"
                    value={(formData.duolingo as string) || ""} 
                    onChange={(e) => updateData({ duolingo: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SAT (Optional)</label>
                  <Input 
                    type="number" 
                    min="400"
                    max="1600"
                    value={(formData.sat as string) || ""} 
                    onChange={(e) => updateData({ sat: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GRE (Optional)</label>
                  <Input 
                    type="number" 
                    min="260"
                    max="340"
                    value={(formData.gre as string) || ""} 
                    onChange={(e) => updateData({ gre: e.target.value })} 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 4: Academic Interests</h2>
              <p className="text-muted-foreground mb-4">Comma separated fields (e.g., Computer Science, Medicine).</p>
              <Input 
                value={(formData.interests as string[])?.join(", ") || ""} 
                onChange={(e) => updateData({ interests: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} 
                placeholder="Enter your interests"
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 5: Country Preferences</h2>
              <p className="text-muted-foreground mb-4">Where do you want to study? (Comma separated)</p>
              <Input 
                value={(formData.countries as string[])?.join(", ") || ""} 
                onChange={(e) => updateData({ countries: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} 
                placeholder="Enter preferred countries"
              />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 6: Career Goals</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Desired Degree Level</label>
                  <Input 
                    value={(formData.desiredDegree as string) || ""} 
                    onChange={(e) => updateData({ desiredDegree: e.target.value })} 
                    placeholder="e.g., Bachelor's, Master's, PhD"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Long Term Goal</label>
                  <Input 
                    value={(formData.longTermGoal as string) || ""} 
                    onChange={(e) => updateData({ longTermGoal: e.target.value })} 
                    placeholder="Describe your long-term career goals"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={mutation.isPending}>
              Back
            </Button>
          ) : <div></div>}
          
          <Button 
            onClick={handleNext} 
            disabled={mutation.isPending} 
            className="gap-2"
          >
            {mutation.isPending ? "Saving..." : step === 6 ? "Complete Setup" : "Continue"}
            {!mutation.isPending && step < 6 && <Icon name="ArrowRight" size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
