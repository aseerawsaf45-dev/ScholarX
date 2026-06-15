'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { calculateGrowthPercentage, getGrowthStage } from '@/lib/growth-engine'
import { revalidatePath } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveOnboardingStep(step: number, data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    if (step === 1) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          educationLevel: data.educationLevel,
          hscGpa: data.hscGpa ? parseFloat(data.hscGpa) : null,
        },
        create: {
          userId: user.id,
          educationLevel: data.educationLevel,
          hscGpa: data.hscGpa ? parseFloat(data.hscGpa) : null,
        }
      })
    }

    if (step === 2) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          district: data.district,
          familyIncome: data.familyIncome,
        },
        create: {
          userId: user.id,
          district: data.district,
          familyIncome: data.familyIncome,
        }
      })
    }

    if (step === 3) {
      await prisma.testScores.upsert({
        where: { userId: user.id },
        update: {
          ielts: data.ielts ? parseFloat(data.ielts) : null,
          toefl: data.toefl ? parseFloat(data.toefl) : null,
        },
        create: {
          userId: user.id,
          ielts: data.ielts ? parseFloat(data.ielts) : null,
          toefl: data.toefl ? parseFloat(data.toefl) : null,
        }
      })
    }

    if (step === 4) {
      await prisma.interest.deleteMany({ where: { userId: user.id } })
      if (data.interests && Array.isArray(data.interests) && data.interests[0] !== "") {
        await prisma.interest.createMany({
          data: data.interests.map((field: string) => ({ userId: user.id, field }))
        })
      }
    }

    if (step === 5) {
      await prisma.countryPreference.deleteMany({ where: { userId: user.id } })
      if (data.countries && Array.isArray(data.countries) && data.countries[0] !== "") {
        await prisma.countryPreference.createMany({
          data: data.countries.map((country: string) => ({ userId: user.id, country }))
        })
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
      })
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
    })

    if (fullProfile) {
      const percentage = calculateGrowthPercentage(fullProfile)
      const stage = getGrowthStage(percentage)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          growthPercent: percentage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          growthStage: stage as any,
        }
      })
    }

    revalidatePath('/dashboard', 'layout')
    return { success: true }
  } catch (error) {
    console.error("Save step error:", error)
    return { error: 'Failed to save data' }
  }
}
