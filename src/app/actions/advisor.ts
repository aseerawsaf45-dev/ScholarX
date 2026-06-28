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

    const systemPrompt = `You are ScholarX AI Advisor, a premium, highly knowledgeable study-abroad counselor.
Your mission is to help Bangladeshi students find scholarships, refine their profile, write outstanding SOPs/CVs, and navigate international admissions successfully.
Provide highly practical, realistic, and detailed advice. Avoid generic, repetitive responses. Show deep empathy and guidance.
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
