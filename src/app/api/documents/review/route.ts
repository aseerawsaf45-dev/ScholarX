import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseDocumentFromUrl } from '@/lib/document-parser';
import { runFullDocumentPipeline } from '@/lib/ai/document-review';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentId, documentType, userId } = body;

    if (!documentId || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Fetch document from DB
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.userId !== userId) {
      return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
    }

    // 2. Fetch User Profile for AI Context
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    const testScores = await prisma.testScores.findUnique({ where: { userId } });
    
    const userProfileInfo = `
      GPA: ${profile?.undergraduateCgpa || profile?.hscGpa || 'N/A'}
      IELTS: ${testScores?.ielts || 'N/A'}
      Target Country: ${profile?.country || 'N/A'}
    `;

    // 3. Parse Document (Step 1 & 2)
    const { extractedText } = await parseDocumentFromUrl(document.fileUrl, document.type || document.name);

    if (!extractedText || extractedText.trim() === '') {
      return NextResponse.json({ error: "Could not extract text from document." }, { status: 422 });
    }

    // 4. Run AI Pipeline (Step 3 & 4)
    const { evaluation, rewrittenText } = await runFullDocumentPipeline(extractedText, documentType || 'DOCUMENT', userProfileInfo);

    // 5. Save to DB (Step 5)
    const review = await prisma.documentReview.create({
      data: {
        documentId: document.id,
        overallScore: evaluation.overallScore,
        clarityScore: evaluation.categoryScores.clarity,
        grammarScore: evaluation.categoryScores.grammar,
        structureScore: evaluation.categoryScores.structure,
        impactScore: evaluation.categoryScores.impact,
        relevanceScore: evaluation.categoryScores.relevance,
        scholarshipReadiness: evaluation.scholarshipReadiness,
        feedbackJson: JSON.parse(JSON.stringify(evaluation)), // Store full evaluation as JSON
        rewrittenText: rewrittenText,
      }
    });

    // Update document status
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "reviewed" }
    });

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 200 });
    
  } catch (error: any) {
    console.error("Document Review API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
