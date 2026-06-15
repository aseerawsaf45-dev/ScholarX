import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { calculateGrowthPercentage } from '@/lib/growth-engine';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const fullProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        testScores: true,
        interests: true,
        countryPreferences: true,
        careerGoal: true,
      }
    });

    if (!fullProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const completionScore = calculateGrowthPercentage(fullProfile);

    return NextResponse.json({ profile: fullProfile, completionScore });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
