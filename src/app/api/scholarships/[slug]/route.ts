import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const scholarship = await prisma.scholarship.findUnique({
      where: { slug }
    });

    if (!scholarship) {
      return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
    }

    // Increment view count asynchronously
    prisma.scholarship.update({
      where: { id: scholarship.id },
      data: { viewCount: { increment: 1 } }
    }).catch(e => console.error("Failed to increment viewCount", e));

    // Create Analytics Record asynchronously
    prisma.scholarshipAnalytics.create({
      data: {
        scholarshipId: scholarship.id,
        views: 1
      }
    }).catch(e => console.error("Failed to create analytics", e));

    return NextResponse.json(scholarship);
  } catch (error) {
    console.error("Scholarship Details API Error:", error);
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}
