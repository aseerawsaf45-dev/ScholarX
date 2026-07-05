import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateEligibilityScore } from '@/lib/scoring-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, scholarshipId } = body;

    if (!userId || !scholarshipId) {
      return NextResponse.json({ error: 'userId and scholarshipId are required' }, { status: 400 });
    }

    // Fetch user profile data
    const userProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const [testScores, countryPreferences, careerGoal, documents] = await Promise.all([
      prisma.testScores.findUnique({ where: { userId } }),
      prisma.countryPreference.findMany({ where: { userId } }),
      prisma.careerGoal.findUnique({ where: { userId } }),
      prisma.document.findMany({ where: { userId } })
    ]);

    const userData = {
      profile: userProfile,
      testScores,
      countryPreferences,
      careerGoal,
      documents
    };

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId }
    });

    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    const result = calculateEligibilityScore(userData, scholarship);

    // Check if score already exists
    const existingScore = await prisma.eligibilityScore.findFirst({
      where: { userId, scholarshipId }
    });

    if (existingScore) {
      await prisma.eligibilityScore.update({
        where: { id: existingScore.id },
        data: {
          matchScore: result.matchScore,
          category: result.category,
          breakdown: result.breakdown as any,
          reasoning: result.reasoning as any,
          flags: result.flags as any
        }
      });
    } else {
      await prisma.eligibilityScore.create({
        data: {
          userId: result.userId,
          scholarshipId: result.scholarshipId,
          matchScore: result.matchScore,
          category: result.category,
          breakdown: result.breakdown as any,
          reasoning: result.reasoning as any,
          flags: result.flags as any
        }
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[ELIGIBILITY_SCORE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
