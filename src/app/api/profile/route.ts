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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, ...profileData } = body;

    // Update user name if provided
    if (firstName !== undefined || lastName !== undefined) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const currentName = dbUser?.name || "";
      const currentParts = currentName.split(" ");
      const fName = firstName !== undefined ? firstName : (currentParts[0] || "");
      const lName = lastName !== undefined ? lastName : (currentParts.slice(1).join(" ") || "");
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: `${fName} ${lName}`.trim()
        }
      });
    }

    // Update profile fields if provided
    if (Object.keys(profileData).length > 0) {
      const dataToUpdate: any = {};
      const floatFields = ['sscGpa', 'hscGpa', 'undergraduateCgpa', 'graduateCgpa'];
      
      for (const [key, value] of Object.entries(profileData)) {
        if (floatFields.includes(key)) {
          dataToUpdate[key] = value !== "" && value !== null && value !== undefined ? parseFloat(value as string) : null;
        } else {
          dataToUpdate[key] = value === "" || value === undefined ? null : value;
        }
      }

      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...dataToUpdate
        },
        update: dataToUpdate
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

    return NextResponse.json({ success: true, profile: fullProfile });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
