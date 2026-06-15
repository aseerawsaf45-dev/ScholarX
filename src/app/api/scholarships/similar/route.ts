import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing scholarship id" }, { status: 400 });
    }

    const current = await prisma.scholarship.findUnique({
      where: { id }
    });

    if (!current) {
      return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
    }

    // A simplified similarity approach: fetch scholarships that match at least one key criterion
    // and sort them by the number of matches in memory. 
    // In production, we'd use raw SQL with weighted scoring or pgvector.
    const candidates = await prisma.scholarship.findMany({
      where: {
        id: { not: id },
        isActive: true,
        OR: [
          { country: current.country },
          { degreeLevel: current.degreeLevel },
          { fundingType: current.fundingType },
        ]
      },
      take: 50 // fetch a subset to score
    });

    const scored = candidates.map(candidate => {
      let score = 0;
      if (candidate.country === current.country) score += 40;
      if (candidate.degreeLevel === current.degreeLevel) score += 30;
      if (candidate.fundingType === current.fundingType) score += 20;
      
      // Fields of study match (JSON array overlap)
      const currentFields = current.fieldsOfStudy as string[];
      const candidateFields = candidate.fieldsOfStudy as string[];
      const sharedFields = currentFields.filter(f => candidateFields.includes(f));
      if (sharedFields.length > 0) score += 10;

      return { ...candidate, _similarityScore: score };
    });

    const similar = scored
      .sort((a, b) => b._similarityScore - a._similarityScore)
      .slice(0, 6)
      .map(({ _similarityScore, ...rest }) => rest);

    return NextResponse.json(similar);
  } catch (error) {
    console.error("Similar Scholarships API Error:", error);
    return NextResponse.json({ error: "Failed to fetch similar scholarships" }, { status: 500 });
  }
}
