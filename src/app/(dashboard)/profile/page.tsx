"use client";

import { useQuery } from "@tanstack/react-query";
import { ProfileCompletionMeter } from "@/components/profile/ProfileCompletionMeter";
import { fadeUp } from "@/lib/motion";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

export default function ProfilePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  }

  if (error || !data?.profile) {
    return <div className="p-8 text-center text-destructive">Error loading profile.</div>;
  }

  const { profile, completionScore } = data;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your academic and personal information.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Icon name="ArrowLeft" className="mr-2" size={16} /> Back to Dashboard
            </Link>
          </Button>
          <Link href="/onboarding">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>
      </div>

      <ProfileCompletionMeter score={completionScore} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Academic Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Education Level:</span> {profile.profile?.educationLevel || "Not provided"}</p>
            <p><span className="text-muted-foreground">Institution:</span> {profile.profile?.institutionName || "Not provided"}</p>
            <p><span className="text-muted-foreground">GPA:</span> {profile.profile?.hscGpa || "Not provided"}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Test Scores</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">IELTS:</span> {profile.testScores?.ielts || "Not taken"}</p>
            <p><span className="text-muted-foreground">TOEFL:</span> {profile.testScores?.toefl || "Not taken"}</p>
            <p><span className="text-muted-foreground">Duolingo:</span> {profile.testScores?.duolingo || "Not taken"}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Career Goals</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Desired Degree:</span> {profile.careerGoal?.desiredDegree || "Not provided"}</p>
            <p><span className="text-muted-foreground">Long Term Goal:</span> {profile.careerGoal?.longTermGoal || "Not provided"}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Preferences</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Countries:</span> {profile.countryPreferences?.map((c: any) => c.country).join(", ") || "None"}</p>
            <p><span className="text-muted-foreground">Interests:</span> {profile.interests?.map((i: any) => i.field).join(", ") || "None"}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm md:col-span-2">
          <h3 className="font-semibold text-lg mb-4">Additional Details & Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <p><span className="text-muted-foreground">SSC GPA:</span> {profile.profile?.sscGpa || "Not provided"}</p>
            <p><span className="text-muted-foreground">Current Semester:</span> {profile.profile?.currentSemester || "Not provided"}</p>
            <p className="sm:col-span-2"><span className="text-muted-foreground">Research Experience:</span> {profile.profile?.researchExperience || "None"}</p>
            <p className="sm:col-span-2"><span className="text-muted-foreground">Publications:</span> {profile.profile?.publications || "None"}</p>
            <p className="sm:col-span-2"><span className="text-muted-foreground">Projects:</span> {profile.profile?.projects || "None"}</p>
            <p className="sm:col-span-2"><span className="text-muted-foreground">Leadership & Volunteering:</span> {profile.profile?.leadership || "None"}</p>
            <p className="sm:col-span-2"><span className="text-muted-foreground">Work Experience:</span> {profile.profile?.workExperience || "None"}</p>
            <p><span className="text-muted-foreground">Programming Skills:</span> {profile.profile?.programmingSkills || "None"}</p>
            <p><span className="text-muted-foreground">Awards:</span> {profile.profile?.awards || "None"}</p>
            <p><span className="text-muted-foreground">Preferred Universities:</span> {profile.profile?.preferredUniversities || "None"}</p>
            <p><span className="text-muted-foreground">Special Circumstances:</span> {profile.profile?.specialCircumstances || "None"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
