import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { awardPoints } from '@/lib/growth-engine';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure the User record exists in our database
    try {
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
    } catch (dbError) {
      console.error("Error upserting user:", dbError);
      return NextResponse.json({ error: 'Failed to initialize user profile' }, { status: 500 });
    }

    const { step, data } = await request.json();

    if (!step || !data) {
      return NextResponse.json({ error: 'Step and data are required' }, { status: 400 });
    }

    // Validate and process each step
    try {
      if (step === 1) {
        if (!data.educationLevel) {
          return NextResponse.json({ error: 'Education level is required' }, { status: 400 });
        }
        
        await prisma.studentProfile.upsert({
          where: { userId: user.id },
          update: {
            educationLevel: data.educationLevel,
            hscGpa: data.hscGpa ? parseFloat(data.hscGpa) : null,
            institutionName: data.institutionName || null,
          },
          create: {
            userId: user.id,
            educationLevel: data.educationLevel,
            hscGpa: data.hscGpa ? parseFloat(data.hscGpa) : null,
            institutionName: data.institutionName || null,
          }
        });
      }

      if (step === 2) {
        await prisma.studentProfile.upsert({
          where: { userId: user.id },
          update: {
            country: data.country || null,
            district: data.district || null,
            city: data.city || null,
            familyIncome: data.familyIncome || null,
          },
          create: {
            userId: user.id,
            country: data.country || null,
            district: data.district || null,
            city: data.city || null,
            familyIncome: data.familyIncome || null,
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
        // Clear existing interests
        await prisma.interest.deleteMany({ where: { userId: user.id } });
        
        // Add new interests
        if (data.interests && Array.isArray(data.interests) && data.interests.length > 0) {
          const validInterests = data.interests.filter((field: string) => field && field.trim());
          if (validInterests.length > 0) {
            await prisma.interest.createMany({
              data: validInterests.map((field: string) => ({ userId: user.id, field: field.trim() })),
              skipDuplicates: true,
            });
          }
        }
      }

      if (step === 5) {
        // Clear existing country preferences
        await prisma.countryPreference.deleteMany({ where: { userId: user.id } });
        
        // Add new preferences
        if (data.countries && Array.isArray(data.countries) && data.countries.length > 0) {
          const validCountries = data.countries.filter((country: string) => country && country.trim());
          if (validCountries.length > 0) {
            await prisma.countryPreference.createMany({
              data: validCountries.map((country: string) => ({ userId: user.id, country: country.trim() })),
              skipDuplicates: true,
            });
          }
        }
      }

      if (step === 6) {
        await prisma.careerGoal.upsert({
          where: { userId: user.id },
          update: {
            desiredDegree: data.desiredDegree || null,
            longTermGoal: data.longTermGoal || null,
          },
          create: {
            userId: user.id,
            desiredDegree: data.desiredDegree || null,
            longTermGoal: data.longTermGoal || null,
          }
        });

        // Award points for completing onboarding
        const existing = await prisma.userProgress.findFirst({
          where: { userId: user.id, action: "COMPLETE_ONBOARDING" }
        });
        if (!existing) {
          await awardPoints(user.id, "COMPLETE_ONBOARDING");
        }
      }
    } catch (dataError) {
      console.error(`Error saving step ${step}:`, dataError);
      return NextResponse.json({ error: `Failed to save step ${step}` }, { status: 500 });
    }

    // Fetch and return updated profile
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

      return NextResponse.json({ success: true, profile: fullProfile });
    } catch (fetchError) {
      console.error("Error fetching updated profile:", fetchError);
      // Still return success even if fetch fails - data was saved
      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ error: error.message || 'Failed to save data' }, { status: 500 });
  }
}
