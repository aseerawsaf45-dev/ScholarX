import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

type RoadmapTaskPayload = {
  title: string;
  description: string;
  category: "ESSENTIAL" | "HIGH_IMPACT" | "OPTIONAL";
  priorityScore: number;
  estimatedTimeDays: number;
  linkedScholarships: string[];
  dependencies: string[]; // local generated IDs to map
  impactOnTreeGrowth: number;
  _localId: string;
};

// Define deterministic tasks based on user gaps
export async function generateRoadmapTasks(userId: string): Promise<RoadmapTaskPayload[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      testScores: true,
      countryPreferences: true,
      documents: true,
      savedScholarships: {
        include: { scholarship: true }
      }
    }
  });

  if (!user) throw new Error("User not found");

  const tasks: RoadmapTaskPayload[] = [];
  const add = (t: RoadmapTaskPayload) => tasks.push(t);

  // GAP ANALYSIS ENGINE

  // 1. Profile Completeness
  if (!user.profile) {
    add({
      _localId: "complete_profile",
      title: "Complete Your Academic Profile",
      description: "Fill out your GPA, degree level, and educational background to unlock personalized scholarship matches.",
      category: "ESSENTIAL",
      priorityScore: 100, // Mandatory
      estimatedTimeDays: 1,
      linkedScholarships: [],
      dependencies: [],
      impactOnTreeGrowth: 20
    });
  }

  // 2. Country Preferences
  if (user.countryPreferences.length === 0) {
    add({
      _localId: "select_countries",
      title: "Select Target Study Destinations",
      description: "Choose the countries you are interested in to narrow down your scholarship search.",
      category: "HIGH_IMPACT",
      priorityScore: 80,
      estimatedTimeDays: 1,
      linkedScholarships: [],
      dependencies: user.profile ? [] : ["complete_profile"],
      impactOnTreeGrowth: 5
    });
  }

  // 3. Test Scores (IELTS/TOEFL)
  let needsIelts = false;
  if (!user.testScores?.ielts && !user.testScores?.toefl) {
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
      impactOnTreeGrowth: 15
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
      impactOnTreeGrowth: 15
    });
  }

  // 4. Documents (CV, SOP, Passport)
  const hasCV = user.documents.some(d => d.documentType === "CV");
  const hasSOP = user.documents.some(d => d.documentType === "SOP");
  const hasPassport = user.documents.some(d => d.documentType === "OTHER" && d.fileName.toLowerCase().includes("passport"));

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
      impactOnTreeGrowth: 10
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
      impactOnTreeGrowth: 10
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
      impactOnTreeGrowth: 20
    });
  }

  // 5. Saved Scholarships specific tasks
  if (user.savedScholarships.length === 0) {
    add({
      _localId: "find_scholarships",
      title: "Shortlist Scholarships",
      description: "Use the Explorer to find and save at least 3 scholarships that match your profile.",
      category: "HIGH_IMPACT",
      priorityScore: 80,
      estimatedTimeDays: 2,
      linkedScholarships: [],
      dependencies: ["complete_profile"],
      impactOnTreeGrowth: 15
    });
  } else {
    // Generate tasks for applying to saved scholarships
    for (const saved of user.savedScholarships) {
      const sch = saved.scholarship;
      
      // Calculate deadline pressure
      const daysUntilDeadline = Math.ceil((sch.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      let deadlineBoost = 0;
      if (daysUntilDeadline < 14) deadlineBoost = 20;
      else if (daysUntilDeadline < 30) deadlineBoost = 10;

      add({
        _localId: `apply_${sch.id}`,
        title: `Apply for ${sch.title}`,
        description: `Submit your application for the ${sch.title} in ${sch.country} before the deadline on ${sch.deadline.toLocaleDateString()}.`,
        category: "ESSENTIAL",
        priorityScore: Math.min(100, 80 + deadlineBoost),
        estimatedTimeDays: 5,
        linkedScholarships: [sch.id],
        dependencies: [
          ...(hasSOP ? [] : ["draft_sop"]),
          ...(hasCV ? [] : ["build_cv"]),
          ...(needsIelts ? ["take_ielts"] : []),
          ...(!hasPassport ? ["apply_passport"] : [])
        ],
        impactOnTreeGrowth: 25
      });
    }
  }

  return tasks;
}

export async function enhanceRoadmapWithAI(tasks: RoadmapTaskPayload[], userId: string): Promise<RoadmapTaskPayload[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, countryPreferences: true }
    });

    // We only enhance the top 5 highest priority tasks to save tokens
    const topTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);

    const prompt = `
You are an expert study-abroad counselor.
User Profile: GPA: ${user?.profile?.undergraduateCgpa || user?.profile?.hscGpa || 'N/A'}, Target Countries: ${user?.countryPreferences.map(c => c.country).join(", ") || 'Undecided'}.

Here are their top roadmap tasks. For each task, provide a one-sentence strategic AI suggestion to help them succeed.
Output format exactly like this, line by line:
[Task ID] | [Your 1-sentence advice]

Tasks:
${topTasks.map(t => `${t._localId} | ${t.title}`).join("\n")}
`;

    const { text } = await generateText({
      model: groq('llama3-8b-8192'),
      prompt,
      maxTokens: 500,
    });

    const lines = text.split('\n').filter(l => l.includes('|'));
    
    const suggestionMap: Record<string, string> = {};
    for (const line of lines) {
      const [id, suggestion] = line.split('|').map(s => s.trim());
      if (id && suggestion) {
        suggestionMap[id] = suggestion;
      }
    }

    return tasks.map(t => {
      if (suggestionMap[t._localId]) {
        return { ...t, aiSuggestion: suggestionMap[t._localId] };
      }
      return t;
    });

  } catch (error) {
    console.error("AI Roadmap Enhancement failed:", error);
    return tasks; // Return original if AI fails
  }
}

export async function syncRoadmapToDB(userId: string) {
  // 1. Generate Deterministic Tasks
  let generatedTasks = await generateRoadmapTasks(userId);
  
  // 2. Enhance with AI Layer (Optional, we'll do it automatically for demonstration)
  generatedTasks = await enhanceRoadmapWithAI(generatedTasks, userId);

  // 3. Sync with DB (Delete old uncompleted tasks and replace? Or smartly merge)
  // For simplicity and to ensure a fully dynamic roadmap, we'll wipe existing 'NOT_STARTED' tasks
  // and re-insert. Completed tasks remain.
  
  const existingCompleted = await prisma.roadmapTask.findMany({
    where: { userId, status: "COMPLETED" },
    select: { title: true } // We use title as a rough unique key to prevent recreating completed tasks
  });
  const completedTitles = new Set(existingCompleted.map(t => t.title));

  // Filter out tasks the user has already completed
  const pendingTasks = generatedTasks.filter(t => !completedTitles.has(t.title));

  await prisma.roadmapTask.deleteMany({
    where: { userId, status: { not: "COMPLETED" } }
  });

  // Map local IDs to CUIDs for dependencies
  // We need to insert them and get their IDs, but to preserve dependency links we can pre-generate IDs or insert in order.
  // Since Prisma allows custom IDs, let's just generate random CUIDs in JS.
  const createId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const idMap = new Map<string, string>();
  for (const t of pendingTasks) {
    idMap.set(t._localId, createId());
  }

  const tasksToCreate = pendingTasks.map(t => ({
    id: idMap.get(t._localId)!,
    userId,
    title: t.title,
    description: t.description,
    category: t.category,
    priorityScore: t.priorityScore,
    estimatedTimeDays: t.estimatedTimeDays,
    linkedScholarships: t.linkedScholarships,
    dependencies: t.dependencies.map(dep => idMap.get(dep)).filter(Boolean) as string[],
    impactOnTreeGrowth: t.impactOnTreeGrowth,
    aiSuggestion: (t as any).aiSuggestion,
    status: "NOT_STARTED"
  }));

  if (tasksToCreate.length > 0) {
    await prisma.roadmapTask.createMany({
      data: tasksToCreate
    });
  }

  return await prisma.roadmapTask.findMany({
    where: { userId },
    orderBy: { priorityScore: 'desc' }
  });
}
