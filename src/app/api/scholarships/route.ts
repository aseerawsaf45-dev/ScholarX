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

    // Building the where clause
    const where: Prisma.ScholarshipWhereInput = {
      isActive: true,
    };

    if (search.trim()) {
      // Postgres basic search syntax, fallback to contains if FTS isn't fully enabled
      // If we added raw tsvector, we'd use queryRaw, but here we use contains for broad matching
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { university: { contains: search, mode: "insensitive" } },
        { provider: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (country.length > 0) {
      where.country = { in: country };
    }

    if (degreeLevel.length > 0) {
      where.degreeLevel = { in: degreeLevel };
    }

    if (fundingType.length > 0) {
      where.fundingType = { in: fundingType };
    }

    if (minGpa !== undefined) {
      where.requiredGPA = { lte: minGpa }; // Users with higher GPA qualify for lower required GPA
    }

    if (minIelts !== undefined) {
      where.requiredIELTS = { lte: minIelts };
    }

    if (fieldsOfStudy.length > 0) {
      where.fieldsOfStudy = {
        array_contains: fieldsOfStudy, // Assuming JSON array contains
      };
    }

    if (deadlineStr && deadlineStr !== "all") {
      const days = parseInt(deadlineStr);
      if (!isNaN(days)) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        where.deadline = { lte: date, gte: new Date() };
      }
    }

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
