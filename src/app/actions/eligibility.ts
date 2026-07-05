"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { calculateEligibilityScore, generateImprovements } from "@/lib/scoring-engine";
import type { EligibilityResult, ImprovementItem } from "@/lib/scoring-engine";

async function getAuthUserOptional() {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    if (userId) return { id: userId };
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

export type ScholarshipEligibilityData = {
  eligibility: EligibilityResult | null;
  improvements: ImprovementItem[];
  matchScore: number;
  matchLabel: string;
  matchColor: string;
};

export async function getScholarshipEligibility(scholarshipId: string): Promise<ScholarshipEligibilityData> {
  const authUser = await getAuthUserOptional();
  if (!authUser) {
    return { eligibility: null, improvements: [], matchScore: 0, matchLabel: "Sign in to see your match", matchColor: "gray" };
  }
  const userId = authUser.id;

  // Fetch user data
  const [userProfile, testScores, countryPreferences, careerGoal, documents, scholarship] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.testScores.findUnique({ where: { userId } }),
    prisma.countryPreference.findMany({ where: { userId } }),
    prisma.careerGoal.findUnique({ where: { userId } }),
    prisma.document.findMany({ where: { userId } }),
    prisma.scholarship.findUnique({ where: { id: scholarshipId } }),
  ]);

  if (!scholarship) {
    return { eligibility: null, improvements: [], matchScore: 0, matchLabel: "Scholarship not found", matchColor: "gray" };
  }

  if (!userProfile) {
    return { eligibility: null, improvements: [], matchScore: 0, matchLabel: "Complete your profile to see your match", matchColor: "gray" };
  }

  const userData = { profile: userProfile, testScores, countryPreferences, careerGoal, documents };

  // Always recalculate (never use stale cached score)
  const result = calculateEligibilityScore(userData, scholarship);
  const improvements = generateImprovements(userData, scholarship);

  // Persist the fresh score (upsert)
  await prisma.eligibilityScore.upsert({
    where: {
      // EligibilityScore has no unique constraint — use findFirst and update/create manually
      id: (await prisma.eligibilityScore.findFirst({ where: { userId, scholarshipId } }))?.id ?? "new",
    },
    update: {
      matchScore: result.matchScore,
      category: result.category,
      breakdown: result.breakdown as any,
      reasoning: result.reasoning as any,
      flags: result.flags as any,
    },
    create: {
      userId,
      scholarshipId,
      matchScore: result.matchScore,
      category: result.category,
      breakdown: result.breakdown as any,
      reasoning: result.reasoning as any,
      flags: result.flags as any,
    },
  }).catch(async () => {
    // Fallback: use createOrUpdate logic without upsert
    const existing = await prisma.eligibilityScore.findFirst({ where: { userId, scholarshipId } });
    if (existing) {
      await prisma.eligibilityScore.update({
        where: { id: existing.id },
        data: {
          matchScore: result.matchScore,
          category: result.category,
          breakdown: result.breakdown as any,
          reasoning: result.reasoning as any,
          flags: result.flags as any,
        },
      });
    } else {
      await prisma.eligibilityScore.create({
        data: {
          userId,
          scholarshipId,
          matchScore: result.matchScore,
          category: result.category,
          breakdown: result.breakdown as any,
          reasoning: result.reasoning as any,
          flags: result.flags as any,
        },
      });
    }
  });

  // Also update ScholarshipMatch for dashboard recommendations
  await prisma.scholarshipMatch.upsert({
    where: { userId_scholarshipId: { userId, scholarshipId } },
    update: { score: result.matchScore },
    create: { userId, scholarshipId, score: result.matchScore },
  }).catch(() => {/* ignore */});

  let matchLabel = "";
  let matchColor = "";
  if (result.flags.strictFail) {
    matchLabel = "Not Eligible";
    matchColor = "red";
  } else if (result.matchScore >= 90) {
    matchLabel = "Exceptional Match";
    matchColor = "emerald";
  } else if (result.matchScore >= 80) {
    matchLabel = "Strong Match";
    matchColor = "green";
  } else if (result.matchScore >= 70) {
    matchLabel = "Competitive";
    matchColor = "yellow";
  } else if (result.matchScore >= 60) {
    matchLabel = "Possible";
    matchColor = "orange";
  } else {
    matchLabel = "Reach";
    matchColor = "red";
  }

  return { eligibility: result, improvements, matchScore: result.matchScore, matchLabel, matchColor };
}
