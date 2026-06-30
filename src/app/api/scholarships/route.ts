import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create client inside handler so env vars are available at runtime, not build time
function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const countries = searchParams.getAll("country");
    const degreeLevels = searchParams.getAll("degreeLevel");
    const fundingTypes = searchParams.getAll("fundingType");
    const deadlineStr = searchParams.get("deadline") || "all";
    const sort = searchParams.get("sort") || "best_match";
    const cursor = searchParams.get("cursor") || null;
    const limit = 20;

    let query = db
      .from("Scholarship")
      .select("id, slug, title, university, country, degreeLevel, fundingType, deadline, requiredGPA, requiredIELTS, provider, amountCovered, description")
      .eq("isActive", true);

    if (search.trim()) {
      query = query.or(
        `title.ilike.%${search}%,university.ilike.%${search}%,provider.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (countries.length > 0) query = query.in("country", countries);
    if (degreeLevels.length > 0) query = query.in("degreeLevel", degreeLevels);
    if (fundingTypes.length > 0) query = query.in("fundingType", fundingTypes);

    if (deadlineStr && deadlineStr !== "all") {
      const days = parseInt(deadlineStr);
      if (!isNaN(days)) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        query = query
          .gte("deadline", new Date().toISOString())
          .lte("deadline", futureDate.toISOString());
      }
    }

    if (cursor) query = query.gt("id", cursor);

    switch (sort) {
      case "newest": query = query.order("createdAt", { ascending: false }); break;
      case "deadline": query = query.order("deadline", { ascending: true }); break;
      case "most_saved": query = query.order("saveCount", { ascending: false }); break;
      case "most_viewed": query = query.order("viewCount", { ascending: false }); break;
      default: query = query.order("updatedAt", { ascending: false });
    }

    query = query.limit(limit + 1);

    const { data: scholarships, error } = await query;

    if (error) {
      console.error("Scholarships query error:", error.message);
      return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 });
    }

    let nextCursor: string | null = null;
    const results = scholarships || [];
    if (results.length > limit) {
      const nextItem = results.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return NextResponse.json({ scholarships: results, nextCursor });
  } catch (error: any) {
    console.error("Scholarships API Error:", error);
    return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 });
  }
}
