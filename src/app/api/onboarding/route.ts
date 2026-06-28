import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { awardPoints } from '@/lib/growth-engine';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Ensure the User record exists in our database
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.user_metadata?.first_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
        : user.email?.split('@')[0] || 'User',
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.first_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
        : user.email?.split('@')[0] || 'User',
    }
  });

  try {
    const { step, data } = await request.json();

    if (step === 1) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          educationLevel: data.educationLevel,
          hscGpa: data.hscGpa ? parseFloat(data.hscGpa) : null,
          institutionName: data.institutionName,
        },
        create: {
          userId: user.id,
          educationLevel: data.educationLevel,
          hscGpa: data.hscGpa ? parseFloat(data.hscGpa) : null,
          institutionName: data.institutionName,
        }
      });
    }

    if (step === 2) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          country: data.country,
          city: data.city,
          familyIncome: data.familyIncome,
        },
        create: {
          userId: user.id,
          country: data.country,
          city: data.city,
          familyIncome: data.familyIncome,
        }
      });
    }

    if (step === 3) {
      await prisma.testScores.upsert({
        where: { userId: user.id },
        update: {
          ielts: data.ielts ? parseFloat(data.ielts) : null,
          toefl: data.toefl ? parseFloat(data.toefl) : null,
          duolingo: data.duolingo ? parseInt(data.duolingo, 10) : null,
          sat: data.sat ? parseInt(data.sat, 10) : null,
          gre: data.gre ? parseInt(data.gre, 10) : null,
        },
        create: {
          userId: user.id,
          ielts: data.ielts ? parseFloat(data.ielts) : null,
          toefl: data.toefl ? parseFloat(data.toefl) : null,
          duolingo: data.duolingo ? parseInt(data.duolingo, 10) : null,
          sat: data.sat ? parseInt(data.sat, 10) : null,
          gre: data.gre ? parseInt(data.gre, 10) : null,
        }
      });
    }

    if (step === 4) {
      await prisma.interest.deleteMany({ where: { userId: user.id } });
      if (data.interests && Array.isArray(data.interests) && data.interests[0] !== "") {
        await prisma.interest.createMany({
          data: data.interests.map((field: string) => ({ userId: user.id, field }))
        });
      }
    }

    if (step === 5) {
      await prisma.countryPreference.deleteMany({ where: { userId: user.id } });
      if (data.countries && Array.isArray(data.countries) && data.countries[0] !== "") {
        await prisma.countryPreference.createMany({
          data: data.countries.map((country: string) => ({ userId: user.id, country }))
        });
      }
    }

    if (step === 6) {
      await prisma.careerGoal.upsert({
        where: { userId: user.id },
        update: {
          desiredDegree: data.desiredDegree,
          longTermGoal: data.longTermGoal,
        },
        create: {
          userId: user.id,
          desiredDegree: data.desiredDegree,
          longTermGoal: data.longTermGoal,
        }
      });
    }

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

    if (step === 6) {
      // Check if they already got the points by seeing if they reached a higher stage maybe?
      // For simplicity, we just award points if it's the final step
      // In a real system, you'd check if UserProgress already has COMPLETE_ONBOARDING
      const existing = await prisma.userProgress.findFirst({
        where: { userId: user.id, action: "COMPLETE_ONBOARDING" }
      });
      if (!existing) {
        await awardPoints(user.id, "COMPLETE_ONBOARDING");
      }
    }

    return NextResponse.json({ success: true, profile: fullProfile });
  } catch (error) {
    console.error("Save step error:", error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
