"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/prisma";

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function askAdvisor(userId: string, messages: { role: "user" | "assistant"; content: string }[]) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return getFallbackAdvice(messages[messages.length - 1].content);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testScores: true,
        countryPreferences: true,
        careerGoal: true,
      }
    });

    const userContext = user ? `
User Profile context:
- Name: ${user.name || "N/A"}
- Education Level: ${user.profile?.educationLevel || "N/A"}
- GPA: SSC: ${user.profile?.sscGpa || "N/A"}, HSC: ${user.profile?.hscGpa || "N/A"}, Undergraduate: ${user.profile?.undergraduateCgpa || "N/A"}
- Test Scores: IELTS: ${user.testScores?.ielts || "N/A"}, TOEFL: ${user.testScores?.toefl || "N/A"}, GRE: ${user.testScores?.gre || "N/A"}
- Target countries: ${user.countryPreferences.map(c => c.country).join(", ") || "N/A"}
- Desired degree level: ${user.careerGoal?.desiredDegree || "N/A"}
- Long term goal: ${user.careerGoal?.longTermGoal || "N/A"}
` : "";

    const systemPrompt = `You are ScholarX's elite AI Scholarship Advisor.
You must think like an International Admission Officer, Scholarship Evaluator, Career Counselor, University Consultant, Education Strategist, Immigration Advisor (academic only), and Student Success Coach.

Never provide generic advice. Every recommendation must be personalized using the student's profile.

PRIMARY GOAL
------------------------------------------------------------
Analyze the student's profile and determine:
1. Current readiness
2. Eligibility
3. Weaknesses
4. Missing requirements
5. Competitive advantages
6. Best scholarship opportunities
7. Complete development roadmap
8. Timeline
9. Milestones
10. Success probability

Your roadmap must transform the student from "Seed" to "Forest."

SEED → FOREST FRAMEWORK
------------------------------------------------------------
Every student belongs to ONE growth stage. Determine the current stage automatically.

Stage 1 🌱 Seed: Student has only an idea. (No passport, no IELTS, no CV). Goal: Build awareness.
Stage 2 🌿 Sprout: Student has started preparing (Passport exists, IELTS prep started). Missing: Application materials. Focus: Preparation.
Stage 3 🌾 Sapling: Student is academically competitive (Good GPA, IELTS, CV, SOP draft, etc.). Missing: Applications. Focus: Execution.
Stage 4 🌳 Young Tree: Student has submitted applications. Needs: Interview prep, visa prep, etc. Focus: Admission success.
Stage 5 🌲 Forest: Student has received admission. Focus: Visa, Pre-departure, accommodation, etc.

ROADMAP FORMAT
------------------------------------------------------------
Generate sections exactly in this order:

SECTION 1: CURRENT STAGE
(Explain WHY)

SECTION 2: PROFILE ANALYSIS
(Analyze Academic, Financial, Leadership, Research, Extracurricular, Language, Documents, Experience, Strengths, Weaknesses)

SECTION 3: READINESS SCORE
(Overall Readiness %, Breakdown of Academics, English, Research, Leadership, Documents, Financial)

SECTION 4: SCHOLARSHIP ELIGIBILITY
(Eligible Now, After IELTS, After Graduation, After Work Experience, Not Eligible - Explain WHY)

SECTION 5: MISSING REQUIREMENTS
(Requirement, Importance, Difficulty, Estimated Completion Time, Priority)

SECTION 6: PRIORITY ROADMAP
(30 Day, 60 Day, 90 Day, 6 Month, 12 Month Plan - each task needs Objective, Reason, Estimated hours, Difficulty, Expected impact)

SECTION 7: COMPETITIVENESS IMPROVEMENT
(Recommend specific projects, hackathons, volunteer work, etc. Explain WHY)

SECTION 8: DOCUMENT ROADMAP
(Status, Priority, Deadline, Tips for each document)

SECTION 9: APPLICATION TIMELINE
(Month-by-month timeline)

SECTION 10: RISK ANALYSIS
(Identify highest risk factors and explain mitigation)

SECTION 11: SUCCESS PROBABILITY
(Estimate Current Chance vs Potential Chance. Explain assumptions)

SECTION 12: AI RECOMMENDATIONS
(Rank top priorities and explain expected impact)

RULES
------------------------------------------------------------
Never recommend impossible scholarships.
Never recommend scholarships outside eligibility.
Always explain reasoning.
Always prioritize realistic opportunities.
Always provide alternatives.
If multiple scholarships exist, rank them.
Use tables wherever useful.
Use checklists.
Use timelines.
Be encouraging but realistic.

OUTPUT STYLE
------------------------------------------------------------
Professional, Clear, Visual, Easy to scan.
Use emojis sparingly. Use progress indicators and milestone tracking.
Never output vague advice. Everything must be actionable.

${userContext}
`;

    const { text } = await generateText({
      model: groq('llama3-8b-8192'),
      system: systemPrompt,
      prompt: messages.map(m => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`).join("\n") + "\nAdvisor:",
    });

    return text;
  } catch (error) {
    console.error("AI Advisor error:", error);
    return getFallbackAdvice(messages[messages.length - 1].content);
  }
}

function getFallbackAdvice(userQuery: string): string {
  const query = userQuery.toLowerCase();
  
  if (query.includes("sop") || query.includes("statement of purpose")) {
    return `### 📝 Statement of Purpose (SOP) Writing Guide
Since you asked about SOPs, here is a structured outline to write a winning Statement of Purpose for international scholarships:

1. **Introduction (10-15%)**: Start with a hook. Connect a personal story or a defining academic moment to your field of interest.
2. **Academic Background (20-25%)**: Highlight key courses, research projects, or achievements. Don't just list them; explain *what* you learned and *how* it prepared you.
3. **Professional/Research Experience (20%)**: Discuss internships, jobs, or research publications. Highlight problem-solving and impact.
4. **Why This Course & University? (15-20%)**: Be specific. Mention professors, research labs, or course modules unique to this university.
5. **Career Goals (10-15%)**: Detail short-term and long-term plans. Explain how this degree is the critical bridge to get there.

*Tip: Keep it between 800 - 1000 words unless specified otherwise. Make sure to get it reviewed by peers or use the **Documents** reviewer section!*`;
  }
  
  if (query.includes("ielts") || query.includes("toefl") || query.includes("english")) {
    return `### 🇬🇧 English Proficiency Prep Guide
To score a 7.5+ band score on your IELTS or equivalent TOEFL, follow this structured prep:

1. **Listening**: Practice active listening with BBC Podcasts, Ted Talks, and Cambridge IELTS listening practice tests.
2. **Reading**: Read scholarly articles, news publications (The Economist, Guardian), and build vocabulary. Focus on skimming and scanning.
3. **Writing**:
   - *Task 1*: Learn to describe trends, graphs, maps, and bar charts objectively.
   - *Task 2*: Practice writing formal argumentative essays with cohesive linking words.
4. **Speaking**: Find a speaking partner, record yourself speaking on cue-card topics for 2 minutes, and work on fluency and pronunciation.

*Generally, a band score of 6.5 or higher is required for master's programs, and 7.0+ for research/teaching assistantships.*`;
  }

  if (query.includes("gpa") || query.includes("cgpa") || query.includes("result")) {
    return `### 🎓 GPA/CGPA Optimization for Scholarships
For international scholarships (like Erasmus, Fulbright, DAAD):
* **High GPA (3.7 - 4.0)**: Excellent! Focus heavily on strengthening your Statement of Purpose (SOP), recommendation letters, and securing research publications to make your profile standout.
* **Moderate GPA (3.0 - 3.6)**: You are highly competitive! Highlight extracurriculars, relevant work experience, and target a high GRE/GMAT score (e.g., GRE 315+) or a strong IELTS (7.5+) to offset your GPA.
* **Lower GPA (< 3.0)**: Don't lose hope. Look for universities in Germany, Sweden, or Italy that focus on credit matching rather than just CGPA. Highlight research experience and target fully funded tuition waiver programs.`;
  }

  return `### 👋 Welcome to ScholarX AI Advisor!
I am here to guide you through your journey of studying abroad and securing scholarships.

Here are some topics you can ask me about:
* **"How do I write a great Statement of Purpose (SOP)?"**
* **"What are the IELTS score requirements for MASTERS in Germany?"**
* **"How can I compensate for a low CGPA?"**
* **"Which documents should I gather first?"**

Please feel free to ask any specific questions about your academic plans!`;
}
