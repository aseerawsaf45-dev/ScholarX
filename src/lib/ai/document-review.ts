import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export const DocumentEvaluationSchema = z.object({
  overallScore: z.number().describe("0-100 overall score"),
  categoryScores: z.object({
    clarity: z.number(),
    grammar: z.number(),
    structure: z.number(),
    impact: z.number(),
    relevance: z.number(),
  }),
  summary: z.string().describe("Short summary of the document"),
  majorIssues: z.array(z.string()),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  rewriteSuggestion: z.string().describe("A short sentence on what needs rewriting"),
  scholarshipReadiness: z.enum(["LOW", "MEDIUM", "HIGH"])
});

export type DocumentEvaluation = z.infer<typeof DocumentEvaluationSchema>;

export async function evaluateDocument(documentText: string, documentType: string, userProfileInfo: string = "Not provided") {
  if (!process.env.GROQ_API_KEY) {
    console.warn("No GROQ_API_KEY found, returning mock evaluation.");
    return {
      overallScore: 75,
      categoryScores: { clarity: 80, grammar: 70, structure: 75, impact: 80, relevance: 70 },
      summary: "A decent draft but lacks structural flow.",
      majorIssues: ["Grammar errors", "Weak opening paragraph"],
      strengths: ["Clear motivation", "Good academic background"],
      improvements: ["Use active voice", "Provide concrete examples"],
      rewriteSuggestion: "Rewrite the opening to hook the reader.",
      scholarshipReadiness: "MEDIUM"
    } as DocumentEvaluation;
  }

  const systemPrompt = `You are an expert academic reviewer for scholarship applications.
Evaluate the document based on: Clarity, Grammar, Structure, Impact, Academic strength, Scholarship competitiveness.
Return ONLY valid JSON.`;

  const userPrompt = `DOCUMENT TYPE: ${documentType}

USER PROFILE:
${userProfileInfo}

DOCUMENT:
"""
${documentText}
"""
`;

  try {
    const { object } = await generateObject({
      model: groq('llama3-70b-8192'),
      schema: DocumentEvaluationSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    return object;
  } catch (error) {
    console.error("Evaluation error:", error);
    throw new Error("Failed to evaluate document.");
  }
}

export async function rewriteDocument(originalText: string, evaluationJson: DocumentEvaluation) {
  if (!process.env.GROQ_API_KEY) {
    return "This is a mock rewritten document. Since no API key was provided, the actual rewrite did not happen. Please configure GROQ_API_KEY.";
  }

  const systemPrompt = `You are an expert scholarship application editor.
Your task is to completely rewrite and improve the provided document.
Maintain the user's core intent and facts, but improve grammar, flow, impact, and academic tone.
Take into account the AI feedback provided. Do not include conversational filler, return ONLY the new document text.`;

  const userPrompt = `ORIGINAL DOCUMENT:
"""
${originalText}
"""

FEEDBACK TO ADDRESS:
${JSON.stringify(evaluationJson, null, 2)}
`;

  try {
    const { text } = await generateText({
      model: groq('llama3-70b-8192'),
      system: systemPrompt,
      prompt: userPrompt,
    });
    return text.trim();
  } catch (error) {
    console.error("Rewrite error:", error);
    throw new Error("Failed to rewrite document.");
  }
}

// Full Pipeline Convenience Function
export async function runFullDocumentPipeline(documentText: string, documentType: string, userProfileInfo: string) {
  console.log("Running Step 1: Evaluation");
  const evaluation = await evaluateDocument(documentText, documentType, userProfileInfo);
  
  console.log("Running Step 2: Rewrite");
  const rewrittenText = await rewriteDocument(documentText, evaluation);

  return {
    evaluation,
    rewrittenText
  };
}
