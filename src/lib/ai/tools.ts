import { tool } from 'ai';
import { z } from 'zod';
import { similaritySearch } from '../vector-search';
import { calculateEligibilityScore } from '../scoring-engine';
import { evaluateDocument } from './document-review';
import prisma from '../prisma';

export const searchScholarshipsTool = tool({
  description: 'Search for scholarships using vector similarity and metadata filtering.',
  parameters: z.object({
    query: z.string().describe('The search query or user intent.'),
    country: z.string().optional().describe('Target country filter.'),
    degree: z.string().optional().describe('Target degree level filter (e.g., UNDERGRADUATE, MASTERS, PHD).'),
    topK: z.number().optional().describe('Number of results to return.'),
  }),
  execute: async ({ query, country, degree, topK }: any) => {
    return similaritySearch({
      query,
      filters: { country, degree },
      topK,
    });
  },
} as any);

export const calculateEligibilityTool = tool({
  description: 'Calculate the eligibility score for a specific scholarship based on the user profile.',
  parameters: z.object({
    userId: z.string().describe('The ID of the user.'),
    scholarshipId: z.string().describe('The ID of the scholarship.'),
  }),
  execute: async ({ userId, scholarshipId }: any) => {
    const userProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!userProfile) throw new Error("User not found");

    const [testScores, countryPreferences, careerGoal, documents, scholarship] = await Promise.all([
      prisma.testScores.findUnique({ where: { userId } }),
      prisma.countryPreference.findMany({ where: { userId } }),
      prisma.careerGoal.findUnique({ where: { userId } }),
      prisma.document.findMany({ where: { userId } }),
      prisma.scholarship.findUnique({ where: { id: scholarshipId } })
    ]);

    if (!scholarship) throw new Error("Scholarship not found");

    const userData = {
      profile: userProfile,
      testScores,
      countryPreferences,
      careerGoal,
      documents
    };

    return calculateEligibilityScore(userData, scholarship);
  },
} as any);

export const analyzeDocumentTool = tool({
  description: 'Analyze a user document (SOP, CV) with AI to get a score and suggestions.',
  parameters: z.object({
    documentText: z.string().describe('The extracted text of the document.'),
    documentType: z.string().describe('The type of document (e.g., SOP, CV).'),
  }),
  execute: async ({ documentText, documentType }: any) => {
    return evaluateDocument(documentText, documentType);
  },
} as any);

export const fetchUserProfileTool = tool({
  description: 'Fetch the full profile of a user.',
  parameters: z.object({
    userId: z.string().describe('The ID of the user.'),
  }),
  execute: async ({ userId }: any) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testScores: true,
        countryPreferences: true,
        careerGoal: true,
        documents: true,
        progressRecords: true,
      }
    });
    return user;
  },
} as any);
