import prisma from '@/lib/prisma';

export type GrowthStageEnum = "SEED" | "SPROUT" | "SAPLING" | "GROWING_TREE" | "SCHOLARSHIP_TREE" | "LEGACY_FOREST";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateGrowthPercentage(profile: any): number {
  let score = 0;
  
  // Access nested profile correctly
  const studentProfile = profile.profile || profile;
  const testScores = profile.testScores;
  const interests = profile.interests || [];
  const countryPreferences = profile.countryPreferences || [];
  const careerGoal = profile.careerGoal;
  
  if (studentProfile.educationLevel && (studentProfile.sscGpa || studentProfile.hscGpa || studentProfile.undergraduateCgpa)) score += 20;
  if (studentProfile.district && studentProfile.familyIncome) score += 15;
  if (testScores && Object.keys(testScores).some(k => k !== 'id' && k !== 'userId' && testScores[k] !== null)) score += 15;
  if (interests && interests.length > 0) score += 15;
  if (countryPreferences && countryPreferences.length > 0) score += 15;
  if (careerGoal && (careerGoal.desiredDegree || careerGoal.studyField)) score += 20;
  
  return Math.min(score, 100);
}

export function getGrowthStage(points: number): GrowthStageEnum {
  if (points <= 20) return "SEED";
  if (points <= 50) return "SPROUT";
  if (points <= 100) return "SAPLING";
  if (points <= 200) return "GROWING_TREE";
  return "SCHOLARSHIP_TREE";
}

const POINT_VALUES = {
  COMPLETE_ONBOARDING: 30,
  ADD_IELTS: 15,
  UPLOAD_CV: 10,
  SAVE_SCHOLARSHIP: 5,
  APPLY_SCHOLARSHIP: 20,
  SCHOLARSHIP_WON: 50
} as const;

export async function awardPoints(userId: string, action: keyof typeof POINT_VALUES) {
  const points = POINT_VALUES[action];
  
  await prisma.userProgress.create({
    data: {
      userId,
      action,
      points
    }
  });

  const totalPointsRecord = await prisma.userProgress.aggregate({
    where: { userId },
    _sum: { points: true }
  });

  const totalPoints = totalPointsRecord._sum.points || 0;
  const stage = getGrowthStage(totalPoints);

  await prisma.user.update({
    where: { id: userId },
    data: {
      growthPercent: totalPoints,
      growthStage: stage
    }
  });

  return { totalPoints, stage };
}
