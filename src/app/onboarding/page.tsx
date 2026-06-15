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
  educationLevel: z.string().min(1, "Required"),
  hscGpa: z.string().optional(),
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

  const mutation = useMutation({
    mutationFn: async (stepData: { step: number; data: any }) => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stepData),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast.error("Failed to save progress");
    }
  });

  // Debounced save
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        mutation.mutate({ step, data: formData });
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [formData, step]); // eslint-disable-line react-hooks/exhaustive-deps

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
        e.errors.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors before continuing");
        return;
      }
    }

    // Force save on next
    mutation.mutate({ step, data: formData });

    if (step < 6) {
      setStep(s => s + 1);
    } else {
      toast.success("Onboarding complete!");
      router.push('/dashboard');
    }
  };

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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 1: Academic Information</h2>
              <div className="space-y-4">
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
                  {errors.educationLevel && <p className="text-xs text-destructive">{errors.educationLevel}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Institution Name</label>
                  <Input value={(formData.institutionName as string) || ""} onChange={(e) => updateData({ institutionName: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">GPA</label>
                  <Input type="number" step="0.01" value={(formData.hscGpa as string) || ""} onChange={(e) => updateData({ hscGpa: e.target.value })} />
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
                  <Input value={(formData.country as string) || "Bangladesh"} onChange={(e) => updateData({ country: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input value={(formData.city as string) || ""} onChange={(e) => updateData({ city: e.target.value })} />
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
                  <Input type="number" step="0.5" value={(formData.ielts as string) || ""} onChange={(e) => updateData({ ielts: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">TOEFL</label>
                  <Input type="number" value={(formData.toefl as string) || ""} onChange={(e) => updateData({ toefl: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Duolingo</label>
                  <Input type="number" value={(formData.duolingo as string) || ""} onChange={(e) => updateData({ duolingo: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">SAT (Optional)</label>
                  <Input type="number" value={(formData.sat as string) || ""} onChange={(e) => updateData({ sat: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">GRE (Optional)</label>
                  <Input type="number" value={(formData.gre as string) || ""} onChange={(e) => updateData({ gre: e.target.value })} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 4: Academic Interests</h2>
              <p className="text-muted-foreground mb-4">Comma separated fields (e.g., Computer Science, Medicine).</p>
              <Input value={(formData.interests as string[])?.join(", ") || ""} onChange={(e) => updateData({ interests: e.target.value.split(',').map((s: string) => s.trim()) })} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 5: Country Preferences</h2>
              <p className="text-muted-foreground mb-4">Where do you want to study? (Comma separated)</p>
              <Input value={(formData.countries as string[])?.join(", ") || ""} onChange={(e) => updateData({ countries: e.target.value.split(',').map((s: string) => s.trim()) })} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <h2 className="text-2xl font-bold mb-6">Step 6: Career Goals</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Short Term Goal</label>
                  <Input value={(formData.desiredDegree as string) || ""} onChange={(e) => updateData({ desiredDegree: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Long Term Goal</label>
                  <Input value={(formData.longTermGoal as string) || ""} onChange={(e) => updateData({ longTermGoal: e.target.value })} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
          ) : <div></div>}
          
          <Button onClick={handleNext} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? "Saving..." : step === 6 ? "Complete Setup" : "Continue"}
            {!mutation.isPending && step < 6 && <Icon name="ArrowRight" size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
