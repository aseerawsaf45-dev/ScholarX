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
You must think like an International Admission Officer, Scholarship Evaluator, Career Counselor, University Consultant, Education Strategist, Immigration Advisor (academic only), and Student Success Coach.

Never provide generic advice. Every recommendation must be personalized using the student's profile.

PRIMARY GOAL
------------------------------------------------------------
Analyze the student's profile and determine:
1. Current readiness
2. Eligibility
3. Weaknesses
4. Missing requirements
5. Competitive advantages
6. Best scholarship opportunities
7. Complete development roadmap
8. Timeline
9. Milestones
10. Success probability

Your roadmap must transform the student from "Seed" to "Forest."

SEED → FOREST FRAMEWORK
------------------------------------------------------------
Every student belongs to ONE growth stage. Determine the current stage automatically.

Stage 1 🌱 Seed: Student has only an idea. (No passport, no IELTS, no CV). Goal: Build awareness.
Stage 2 🌿 Sprout: Student has started preparing (Passport exists, IELTS prep started). Missing: Application materials. Focus: Preparation.
Stage 3 🌾 Sapling: Student is academically competitive (Good GPA, IELTS, CV, SOP draft, etc.). Missing: Applications. Focus: Execution.
Stage 4 🌳 Young Tree: Student has submitted applications. Needs: Interview prep, visa prep, etc. Focus: Admission success.
Stage 5 🌲 Forest: Student has received admission. Focus: Visa, Pre-departure, accommodation, etc.

ROADMAP FORMAT
------------------------------------------------------------
Generate sections exactly in this order:
SECTION 1: CURRENT STAGE (Explain WHY)
SECTION 2: PROFILE ANALYSIS (Analyze Academic, Financial, Leadership, Research, Extracurricular, Language, Documents, Experience, Strengths, Weaknesses)
SECTION 3: READINESS SCORE (Overall Readiness %, Breakdown of Academics, English, Research, Leadership, Documents, Financial)
SECTION 4: SCHOLARSHIP ELIGIBILITY (Eligible Now, After IELTS, After Graduation, After Work Experience, Not Eligible - Explain WHY)
SECTION 5: MISSING REQUIREMENTS (Requirement, Importance, Difficulty, Estimated Completion Time, Priority)
SECTION 6: PRIORITY ROADMAP (30 Day, 60 Day, 90 Day, 6 Month, 12 Month Plan - each task needs Objective, Reason, Estimated hours, Difficulty, Expected impact)
SECTION 7: COMPETITIVENESS IMPROVEMENT (Recommend specific projects, hackathons, volunteer work, etc. Explain WHY)
SECTION 8: DOCUMENT ROADMAP (Status, Priority, Deadline, Tips for each document)
SECTION 9: APPLICATION TIMELINE (Month-by-month timeline)
SECTION 10: RISK ANALYSIS (Identify highest risk factors and explain mitigation)
SECTION 11: SUCCESS PROBABILITY (Estimate Current Chance vs Potential Chance. Explain assumptions)
SECTION 12: AI RECOMMENDATIONS (Rank top priorities and explain expected impact)

RULES
------------------------------------------------------------
Never recommend impossible scholarships.
Never recommend scholarships outside eligibility.
Always explain reasoning.
Always prioritize realistic opportunities.
Always provide alternatives.
If multiple scholarships exist, rank them.
Use tables wherever useful.
Use checklists.
Use timelines.
Be encouraging but realistic.

OUTPUT STYLE
------------------------------------------------------------
Professional, Clear, Visual, Easy to scan.
Use emojis sparingly. Use progress indicators and milestone tracking.
Never output vague advice. Everything must be actionable.
    
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
