import prisma from "@/lib/prisma";

export async function syncUserDeadlines(userId: string) {
  // 1. Fetch user's active/saved scholarships and matches
  const savedScholarships = await prisma.savedScholarship.findMany({
    where: { userId },
    include: {
      scholarship: {
        include: { deadlines: true }
      }
    }
  });

  const matches = await prisma.scholarshipMatch.findMany({
    where: { userId, score: { gte: 60 } },
    include: {
      scholarship: {
        include: { deadlines: true }
      }
    }
  });

  // Combine unique scholarships that have deadlines
  const scholarshipMap = new Map();
  
  savedScholarships.forEach(s => {
    if (s.scholarship.deadlines.length > 0) scholarshipMap.set(s.scholarshipId, { ...s.scholarship, isSaved: true, matchScore: 100 });
  });

  matches.forEach(m => {
    if (m.scholarship.deadlines.length > 0 && !scholarshipMap.has(m.scholarshipId)) {
      scholarshipMap.set(m.scholarshipId, { ...m.scholarship, isSaved: false, matchScore: m.score });
    }
  });

  const uniqueScholarships = Array.from(scholarshipMap.values());

  // 2. For each deadline, calculate priority and upsert into UserDeadline
  for (const sch of uniqueScholarships) {
    for (const deadline of sch.deadlines) {
      
      // Priority Formula: 
      // Base = Match Score (0-100)
      // Multiplier = Proximity (Days remaining)
      const daysRemaining = Math.ceil((deadline.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining < 0) continue; // Skip already passed

      let priorityScore = sch.matchScore; // Base
      if (sch.isSaved) priorityScore += 20;

      if (daysRemaining <= 3) priorityScore += 100;
      else if (daysRemaining <= 7) priorityScore += 70;
      else if (daysRemaining <= 14) priorityScore += 40;
      else if (daysRemaining <= 30) priorityScore += 20;

      // Cap at 100 or higher
      const finalPriority = Math.min(100, Math.max(0, priorityScore));

      const existing = await prisma.userDeadline.findFirst({
        where: { userId, deadlineId: deadline.id }
      });

      if (!existing) {
        await prisma.userDeadline.create({
          data: {
            userId,
            scholarshipId: sch.id,
            deadlineId: deadline.id,
            status: "UPCOMING",
            progressPercent: 0
          }
        });
      } else {
        // We could optionally update priority here if we stored it on UserDeadline
        // But for now it's computed dynamically or we rely on the fetching logic
      }
    }
  }

  // 3. Return sorted deadlines
  return await getSortedUserDeadlines(userId);
}

export async function getSortedUserDeadlines(userId: string) {
  const userDeadlines = await prisma.userDeadline.findMany({
    where: { userId },
    include: {
      deadline: true,
      scholarship: {
        select: { title: true, country: true, fundingType: true, slug: true }
      }
    }
  });

  // Calculate dynamic priority for sorting
  const withPriority = userDeadlines.map(ud => {
    const daysRemaining = Math.ceil((ud.deadline.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    let urgencyLevel = "LOW";
    let score = 0;

    if (daysRemaining < 0) {
      urgencyLevel = "MISSED";
      score = -100;
    } else if (daysRemaining <= 7) {
      urgencyLevel = "URGENT";
      score = 100 + (7 - daysRemaining); // Closer is higher
    } else if (daysRemaining <= 30) {
      urgencyLevel = "HIGH";
      score = 80 + (30 - daysRemaining);
    } else if (daysRemaining <= 90) {
      urgencyLevel = "MEDIUM";
      score = 50;
    } else {
      urgencyLevel = "LOW";
      score = 20;
    }

    return { ...ud, daysRemaining, urgencyLevel, dynamicScore: score };
  });

  // Sort by highest score first
  return withPriority.sort((a, b) => b.dynamicScore - a.dynamicScore);
}
