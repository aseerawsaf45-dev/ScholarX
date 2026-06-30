import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

type RoadmapTaskPayload = {
  title: string;
  description: string;
  category: "ESSENTIAL" | "HIGH_IMPACT" | "OPTIONAL";
  priorityScore: number;
  estimatedTimeDays: number;
  linkedScholarships: string[];
  dependencies: string[];
  impactOnTreeGrowth: number;
  _localId: string;
};

export async function generateRoadmapTasks(userId: string): Promise<RoadmapTaskPayload[]> {
  const db = getDb();

  // Fetch user with all related data via Supabase client
  const { data: user } = await db
    .from("User")
    .select(`
      id, name,
      profile:StudentProfile(*),
      testScores:TestScores(*),
      countryPreferences:CountryPreference(*),
      documents:Document(*),
      savedScholarships:SavedScholarship(*, scholarship:Scholarship(*))
    `)
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");

  const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
  const testScores = Array.isArray(user.testScores) ? user.testScores[0] : user.testScores;
  const countryPreferences = user.countryPreferences || [];
  const documents = user.documents || [];
  const savedScholarships = user.savedScholarships || [];

  const tasks: RoadmapTaskPayload[] = [];
  const add = (t: RoadmapTaskPayload) => tasks.push(t);

  // 1. Profile Completeness
  if (!profile) {
    add({
      _localId: "complete_profile",
      title: "Complete Your Academic Profile",
      description: "Fill out your GPA, degree level, and educational background to unlock personalized scholarship matches.",
      category: "ESSENTIAL",
      priorityScore: 100,
      estimatedTimeDays: 1,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 20,
    });
  }

  // 2. Country Preferences
  if (countryPreferences.length === 0) {
    add({
      _localId: "select_countries",
      title: "Select Target Study Destinations",
      description: "Choose the countries you are interested in to narrow down your scholarship search.",
      category: "HIGH_IMPACT",
      priorityScore: 80,
      estimatedTimeDays: 1,
      linkedScholarships: [],
      dependencies: profile ? [] : ["complete_profile"],
      impactOnTreeGrowth: 5,
    });
  }

  // 3. Test Scores (IELTS/TOEFL)
  let needsIelts = false;
  if (!testScores?.ielts && !testScores?.toefl) {
    needsIelts = true;
    add({
      _localId: "prep_ielts",
      title: "Prepare for IELTS/TOEFL",
      description: "English proficiency is mandatory for most international scholarships. Start a preparation plan.",
      category: "ESSENTIAL",
      priorityScore: 90,
      estimatedTimeDays: 30,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 15,
    });
    add({
      _localId: "take_ielts",
      title: "Take IELTS/TOEFL Exam",
      description: "Register for and complete your official English proficiency exam.",
      category: "ESSENTIAL",
      priorityScore: 100,
      estimatedTimeDays: 2,
      linkedScholarships: [],
      dependencies: ["prep_ielts"],
      impactOnTreeGrowth: 15,
    });
  }

  // 4. Documents
  const hasCV = documents.some((d: any) => d.type === "CV");
  const hasSOP = documents.some((d: any) => d.type === "SOP");
  const hasPassport = documents.some((d: any) => d.type === "OTHER" && d.name?.toLowerCase().includes("passport"));

  if (!hasPassport) {
    add({
      _localId: "apply_passport",
      title: "Apply for a Passport",
      description: "You must have a valid passport to apply for international studies.",
      category: "ESSENTIAL",
      priorityScore: 100,
      estimatedTimeDays: 21,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 10,
    });
  }

  if (!hasCV) {
    add({
      _localId: "build_cv",
      title: "Build an Academic CV",
      description: "Create a professional CV highlighting your education, achievements, and extracurriculars.",
      category: "HIGH_IMPACT",
      priorityScore: 85,
      estimatedTimeDays: 3,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 10,
    });
  }

  if (!hasSOP) {
    add({
      _localId: "draft_sop",
      title: "Draft your Statement of Purpose (SOP)",
      description: "Write a compelling SOP outlining your motivations and career goals.",
      category: "HIGH_IMPACT",
      priorityScore: 95,
      estimatedTimeDays: 7,
      linkedScholarships: [],
      dependencies: ["build_cv"],
      impactOnTreeGrowth: 20,
    });
  }

  // 5. Saved Scholarships
  if (savedScholarships.length === 0) {
    add({
      _localId: "find_scholarships",
      title: "Shortlist Scholarships",
      description: "Use the Explorer to find and save at least 3 scholarships that match your profile.",
      category: "HIGH_IMPACT",
      priorityScore: 80,
      estimatedTimeDays: 2,
      linkedScholarships: [],
      dependencies: ["complete_profile"],
      impactOnTreeGrowth: 15,
    });
  } else {
    for (const saved of savedScholarships) {
      const sch = saved.scholarship;
      if (!sch) continue;
      const deadline = sch.deadline ? new Date(sch.deadline) : null;
      const daysUntilDeadline = deadline
        ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 999;
      const deadlineBoost = daysUntilDeadline < 14 ? 20 : daysUntilDeadline < 30 ? 10 : 0;

      add({
        _localId: `apply_${sch.id}`,
        title: `Apply for ${sch.title}`,
        description: `Submit your application for ${sch.title} in ${sch.country}${deadline ? ` before ${deadline.toLocaleDateString()}` : ''}.`,
        category: "ESSENTIAL",
        priorityScore: Math.min(100, 80 + deadlineBoost),
        estimatedTimeDays: 5,
        linkedScholarships: [sch.id],
        dependencies: [
          ...(hasSOP ? [] : ["draft_sop"]),
          ...(hasCV ? [] : ["build_cv"]),
          ...(needsIelts ? ["take_ielts"] : []),
          ...(!hasPassport ? ["apply_passport"] : []),
        ],
        impactOnTreeGrowth: 25,
      });
    }
  }

  return tasks;
}

export async function enhanceRoadmapWithAI(tasks: RoadmapTaskPayload[], userId: string): Promise<RoadmapTaskPayload[]> {
  try {
    const db = getDb();
    const { data: user } = await db
      .from("User")
      .select(`profile:StudentProfile(*), countryPreferences:CountryPreference(country)`)
      .eq("id", userId)
      .single();

    const profile = Array.isArray(user?.profile) ? user?.profile[0] : user?.profile;
    const countryPreferences = user?.countryPreferences || [];
    const topTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);

    const prompt = `You are an expert study-abroad counselor.
User Profile: GPA: ${profile?.undergraduateCgpa || profile?.hscGpa || 'N/A'}, Target Countries: ${countryPreferences.map((c: any) => c.country).join(", ") || 'Undecided'}.

Here are their top roadmap tasks. For each task, provide a one-sentence strategic AI suggestion to help them succeed.
Output format exactly like this, line by line:
[Task ID] | [Your 1-sentence advice]

Tasks:
${topTasks.map(t => `${t._localId} | ${t.title}`).join("\n")}`;

    const { text } = await generateText({ model: groq('llama3-8b-8192'), prompt });

    const suggestionMap: Record<string, string> = {};
    for (const line of text.split('\n').filter(l => l.includes('|'))) {
      const [id, suggestion] = line.split('|').map(s => s.trim());
      if (id && suggestion) suggestionMap[id] = suggestion;
    }

    return tasks.map(t => suggestionMap[t._localId] ? { ...t, aiSuggestion: suggestionMap[t._localId] } : t);
  } catch (error) {
    console.error("AI Roadmap Enhancement failed:", error);
    return tasks;
  }
}

export async function syncRoadmapToDB(userId: string) {
  const db = getDb();

  // 1. Generate tasks
  let generatedTasks = await generateRoadmapTasks(userId);

  // 2. Enhance with AI (optional)
  generatedTasks = await enhanceRoadmapWithAI(generatedTasks, userId);

  // 3. Get completed task titles to preserve them
  const { data: existingCompleted } = await db
    .from("RoadmapTask")
    .select("title")
    .eq("userId", userId)
    .eq("status", "COMPLETED");

  const completedTitles = new Set((existingCompleted || []).map((t: any) => t.title));
  const pendingTasks = generatedTasks.filter(t => !completedTitles.has(t.title));

  // 4. Delete non-completed tasks
  await db.from("RoadmapTask").delete().eq("userId", userId).neq("status", "COMPLETED");

  // 5. Map local IDs to real IDs
  const createId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const idMap = new Map<string, string>();
  for (const t of pendingTasks) idMap.set(t._localId, createId());

  const tasksToCreate = pendingTasks.map(t => ({
    id: idMap.get(t._localId)!,
    userId,
    title: t.title,
    description: t.description,
    category: t.category,
    priorityScore: t.priorityScore,
    estimatedTimeDays: t.estimatedTimeDays,
    linkedScholarships: t.linkedScholarships,
    dependencies: t.dependencies.map(dep => idMap.get(dep)).filter(Boolean),
    impactOnTreeGrowth: t.impactOnTreeGrowth,
    aiSuggestion: (t as any).aiSuggestion || null,
    status: "NOT_STARTED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  if (tasksToCreate.length > 0) {
    const { error } = await db.from("RoadmapTask").insert(tasksToCreate);
    if (error) console.error("Insert roadmap tasks error:", error.message);
  }

  // 6. Return all tasks
  const { data: allTasks } = await db
    .from("RoadmapTask")
    .select("*")
    .eq("userId", userId)
    .order("priorityScore", { ascending: false });

  return allTasks || [];
}
