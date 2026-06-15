import { streamText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { searchScholarshipsTool, calculateEligibilityTool, analyzeDocumentTool, fetchUserProfileTool } from '@/lib/ai/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export const maxDuration = 60; // Allow up to 60s for Vercel edge functions if needed

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Build the AI Context
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testScores: true,
        countryPreferences: true,
        careerGoal: true,
        progressRecords: true,
      }
    });

    const aiContext = {
      profile: profile?.profile,
      testScores: profile?.testScores,
      careerGoal: profile?.careerGoal,
      countryPreferences: profile?.countryPreferences,
      treeStage: profile?.growthStage,
    };

    const systemPrompt = `You are ScholarX's elite AI Scholarship Advisor.
    Your goal is to provide accurate, data-driven advice about scholarships and study abroad roadmaps.
    
    Current User Context:
    ${JSON.stringify(aiContext, null, 2)}
    
    SAFETY & ACCURACY RULES:
    1. NEVER invent or hallucinate scholarships. ALWAYS use the searchScholarshipsTool to find real data.
    2. NEVER fake eligibility scores. ALWAYS use calculateEligibilityTool to check their exact score.
    3. Output must be structured strictly according to the roadmap and eligibility format if asked for a full roadmap.
    4. Provide Step-by-step roadmap when asked.
    5. Say "insufficient data" if you cannot find scholarships matching their profile.
    `;

    if (!process.env.GROQ_API_KEY) {
      // Mock streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode("GROQ_API_KEY is not configured. This is a mock response from the AI Advisor. "));
          controller.enqueue(encoder.encode("Based on your profile, you are Partially Eligible for scholarships in Germany."));
          controller.close();
        }
      });
      return new Response(stream);
    }

    const result = await streamText({
      model: groq('llama3-70b-8192'),
      system: systemPrompt,
      messages,
      tools: {
        searchScholarships: searchScholarshipsTool,
        calculateEligibility: calculateEligibilityTool,
        analyzeDocument: analyzeDocumentTool,
        fetchUserProfile: fetchUserProfileTool,
      },
      maxSteps: 5, // Allow the model to call tools and respond
    } as any);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Advisor Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
