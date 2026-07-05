import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DegreeLevel, FundingType, Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parsing parameters
    const search = searchParams.get("search") || "";
    const country = searchParams.getAll("country"); // e.g., ?country=Germany&country=Canada
    const degreeLevel = searchParams.getAll("degreeLevel") as DegreeLevel[];
    const fundingType = searchParams.getAll("fundingType") as FundingType[];
    const fieldsOfStudy = searchParams.getAll("fieldsOfStudy");
    
    const minGpa = searchParams.get("minGpa") ? parseFloat(searchParams.get("minGpa")!) : undefined;
    const minIelts = searchParams.get("minIelts") ? parseFloat(searchParams.get("minIelts")!) : undefined;
    const deadlineStr = searchParams.get("deadline"); // '7', '30', '90', 'all'
    const sort = searchParams.get("sort") || "best_match";
    const cursor = searchParams.get("cursor");
    const limit = 20;

    // Building the where conditions safely using AND to prevent OR collisions
    const conditions: Prisma.ScholarshipWhereInput[] = [
      { isActive: true }
    ];

    if (search.trim()) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { university: { contains: search, mode: "insensitive" } },
          { provider: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      });
    }

    if (country.length > 0) {
      conditions.push({ country: { in: country } });
    }

    if (degreeLevel.length > 0) {
      conditions.push({ degreeLevel: { in: degreeLevel } });
    }

    if (fundingType.length > 0) {
      conditions.push({ fundingType: { in: fundingType } });
    }

    // Skip filtering when gpa is the default minimum (2.0 or lower)
    if (minGpa !== undefined && minGpa > 2.0) {
      conditions.push({
        OR: [
          { requiredGPA: { lte: minGpa } },
          { requiredGPA: null }
        ]
      });
    }

    // Skip filtering when IELTS is the default minimum (0)
    if (minIelts !== undefined && minIelts > 0) {
      conditions.push({
        OR: [
          { requiredIELTS: { lte: minIelts } },
          { requiredIELTS: null }
        ]
      });
    }

    if (fieldsOfStudy.length > 0) {
      conditions.push({
        OR: fieldsOfStudy.map(field => ({
          fieldsOfStudy: {
            array_contains: field
          }
        }))
      });
    }

    if (deadlineStr && deadlineStr !== "all") {
      const days = parseInt(deadlineStr);
      if (!isNaN(days)) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        conditions.push({
          deadline: { lte: date, gte: new Date() }
        });
      }
    }

    const where: Prisma.ScholarshipWhereInput = {
      AND: conditions
    };

    // Building the orderBy clause
    let orderBy: Prisma.ScholarshipOrderByWithRelationInput | Prisma.ScholarshipOrderByWithRelationInput[] = {};
    
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "deadline":
        orderBy = { deadline: "asc" };
        break;
      case "most_saved":
        orderBy = { saveCount: "desc" };
        break;
      case "most_viewed":
        orderBy = { viewCount: "desc" };
        break;
      case "best_match":
      default:
        // By default, just sort by recently updated or id, real "best_match" requires complex scoring
        orderBy = { updatedAt: "desc" };
        break;
    }

    // Execute query
    const scholarships = await prisma.scholarship.findMany({
      where,
      orderBy,
      take: limit + 1, // Fetch one extra to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        slug: true,
        title: true,
        university: true,
        country: true,
        degreeLevel: true,
        fundingType: true,
        deadline: true,
        requiredGPA: true,
        requiredIELTS: true,
        // Include partial details for the card
      }
    });

    let nextCursor: typeof cursor | null = null;
    if (scholarships.length > limit) {
      const nextItem = scholarships.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      scholarships,
      nextCursor,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 });
  }
}
