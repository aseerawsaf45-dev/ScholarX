import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEligibilityScore } from '@/lib/scoring-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, scholarshipIds } = body;

    if (!userId || !scholarshipIds || !Array.isArray(scholarshipIds)) {
      return NextResponse.json({ error: 'userId and an array of scholarshipIds are required' }, { status: 400 });
    }

    // Fetch user profile data ONCE
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

    // Fetch scholarships
    const scholarships = await prisma.scholarship.findMany({
      where: { id: { in: scholarshipIds } }
    });

    const results = scholarships.map(scholarship => {
      const score = calculateEligibilityScore(userData, scholarship);
      // We do not persist batch scores to avoid DB throttling during search/explorer use
      // Return as expected ScholarshipWithScore structure
      return { 
        ...scholarship,
        eligibilityResult: score 
      };
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[ELIGIBILITY_BATCH_SCORE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
