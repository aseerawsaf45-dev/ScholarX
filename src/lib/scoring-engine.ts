import { Scholarship, StudentProfile, TestScores, CountryPreference, CareerGoal, Document } from '@prisma/client';

export type UserProfileData = {
  profile: StudentProfile;
  testScores: TestScores | null;
  countryPreferences: CountryPreference[];
  careerGoal: CareerGoal | null;
  documents: Document[];
};

export type EligibilityResult = {
  scholarshipId: string;
  userId: string;
  matchScore: number;
  category: "Fully Eligible" | "Partially Eligible" | "Not Eligible";
  breakdown: {
    gpa: number;
    language: number;
    country: number;
    field: number;
    degree: number;
    documents: number;
    extracurricular: number;
  };
  reasoning: string[];
  flags: {
    strictFail: boolean;
    missingDocuments: string[];
    blockedApplication: boolean;
  };
};

export function calculateEligibilityScore(user: UserProfileData, scholarship: Scholarship): EligibilityResult {
  let gpaScore = 0;
  let gpaReason = "";
  let strictFail = false;

  // 1. GPA Score (30 points)
  let userGpa: number | null = null;
  if (scholarship.degreeLevel === "MASTERS" || scholarship.degreeLevel === "PHD") {
    userGpa = user.profile.undergraduateCgpa || user.profile.graduateCgpa || user.profile.hscGpa;
  } else if (scholarship.degreeLevel === "UNDERGRADUATE") {
    userGpa = user.profile.hscGpa || user.profile.sscGpa;
  } else {
    userGpa = user.profile.undergraduateCgpa || user.profile.hscGpa || user.profile.sscGpa;
  }

  const reqGpa = scholarship.requiredGPA;

  if (!userGpa) {
    gpaScore = 0;
    gpaReason = "Missing GPA information → 0 score.";
    if (scholarship.strictGpa) {
      strictFail = true;
      gpaReason = "Missing GPA AND strict GPA rule applies → hard fail.";
    }
  } else if (reqGpa) {
    if (userGpa >= reqGpa) {
      gpaScore = 30;
      gpaReason = `GPA meets requirement (${userGpa} ≥ ${reqGpa}) → full score awarded.`;
    } else {
      gpaScore = Math.min(30, Math.max(0, (userGpa / reqGpa) * 30));
      gpaReason = `GPA below requirement (${userGpa} < ${reqGpa}) → proportional score applied.`;
      if (scholarship.strictGpa) {
        gpaScore = 0;
        gpaReason = `GPA below requirement (${userGpa} < ${reqGpa}) AND strict GPA rule applies → hard fail.`;
        strictFail = true;
      }
    }
  } else {
    gpaScore = 30;
    gpaReason = "No specific GPA requirement → full score awarded.";
  }

  // 2. Language Score (20 points)
  let langScore = 0;
  let langReason = "";
  const reqIelts = scholarship.requiredIELTS;
  const reqToefl = scholarship.requiredTOEFL;

  const userIelts = user.testScores?.ielts || null;
  const userToefl = user.testScores?.toefl || null;

  let effectiveUserIelts = userIelts;
  if (!effectiveUserIelts && userToefl) {
    effectiveUserIelts = userToefl * (9 / 120);
  }

  if (!reqIelts && !reqToefl) {
    langScore = 20;
    langReason = "No language requirement → full score awarded.";
  } else {
    const reqScore = reqIelts || (reqToefl ? reqToefl * (9 / 120) : null);
    
    if (!effectiveUserIelts) {
      langScore = 0;
      langReason = "Missing language test scores → 0 score.";
      if (scholarship.strictLanguage) {
        strictFail = true;
        langReason = "Missing language scores AND strict language rule applies → hard fail.";
      }
    } else if (reqScore) {
      if (effectiveUserIelts >= reqScore) {
        langScore = 20;
        langReason = `Language score meets requirement → full score awarded.`;
      } else {
        langScore = Math.max(0, (effectiveUserIelts / reqScore) * 20);
        langReason = `Language score below requirement → partial score applied.`;
        if (scholarship.strictLanguage) {
          langScore = 0;
          strictFail = true;
          langReason = `Language score below requirement AND strict rule applies → hard fail.`;
        }
      }
    }
  }

  // 3. Country Match (10 points)
  let countryScore = 3;
  let countryReason = "Country does not match directly → base score.";
  if (user.profile.country && user.profile.country.toLowerCase() === scholarship.country.toLowerCase()) {
    countryScore = 10;
    countryReason = "Student country matches target country → full points.";
  } else {
    const prefs = user.countryPreferences.map(c => c.country.toLowerCase());
    if (prefs.includes(scholarship.country.toLowerCase())) {
      countryScore = 8;
      countryReason = "Target country is in preferred region → 8 points.";
    }
  }

  // 4. Field Match (15 points)
  let fieldScore = 0;
  let fieldReason = "No match with eligible fields → 0 points.";
  const userField = user.careerGoal?.studyField?.toLowerCase() || "";
  const eligibleFields: string[] = Array.isArray(scholarship.fieldsOfStudy) 
    ? (scholarship.fieldsOfStudy as string[]).map(f => f.toLowerCase())
    : [];

  if (eligibleFields.length === 0) {
    fieldScore = 15;
    fieldReason = "No specific field requirement → full points.";
  } else if (userField) {
    if (eligibleFields.includes(userField)) {
      fieldScore = 15;
      fieldReason = "Exact field match → full points.";
    } else {
      const isPartial = eligibleFields.some(f => f.includes(userField) || userField.includes(f));
      if (isPartial) {
        fieldScore = 10;
        fieldReason = "Partial field overlap → partial points.";
      }
    }
  }

  // 5. Degree Match (10 points)
  let degreeScore = 0;
  let degreeReason = "Degree level mismatch.";
  const targetDegree = scholarship.degreeLevel;

  let userCurrentDegree = "HIGH_SCHOOL";
  if (user.profile.graduateCgpa) userCurrentDegree = "MASTERS";
  else if (user.profile.undergraduateCgpa) userCurrentDegree = "UNDERGRADUATE";
  else if (user.profile.hscGpa) userCurrentDegree = "HIGH_SCHOOL";

  let userDesiredDegree = user.careerGoal?.desiredDegree?.toUpperCase();
  if (!userDesiredDegree) {
    if (userCurrentDegree === "HIGH_SCHOOL") userDesiredDegree = "UNDERGRADUATE";
    else if (userCurrentDegree === "UNDERGRADUATE") userDesiredDegree = "MASTERS";
    else if (userCurrentDegree === "MASTERS") userDesiredDegree = "PHD";
  }

  if (userDesiredDegree === targetDegree) {
    degreeScore = 10;
    degreeReason = "Desired degree matches target level → full points.";
  } else {
    degreeScore = 5;
    degreeReason = "Degree level mismatch → partial points.";
  }

  // 6. Document Completeness (10 points)
  let docScore = 0;
  let missingDocs: string[] = [];
  let blockedApplication = false;

  const userDocs = user.documents.map(d => d.type.toLowerCase());
  const hasCv = userDocs.includes("cv") || userDocs.includes("resume");
  const hasSop = userDocs.includes("sop") || userDocs.includes("statement of purpose") || userDocs.includes("personal statement");
  const hasPassport = userDocs.includes("passport");

  if (hasCv) docScore += 3; else missingDocs.push("cv");
  if (hasSop) docScore += 3; else missingDocs.push("sop");
  if (hasPassport) docScore += 4; else { missingDocs.push("passport"); blockedApplication = true; }

  let docReason = docScore === 10 
    ? "All required documents present → full score." 
    : `Missing documents (${missingDocs.join(", ")}) → partial score.`;

  // 7. Extracurricular Boost (5 points)
  const extra = user.profile.extracurricularScore || 0;
  let extraScore = 0;
  if (extra <= 2) extraScore = 1;
  else if (extra <= 5) extraScore = 2;
  else if (extra <= 8) extraScore = 4;
  else extraScore = 5;

  let extraReason = `Extracurricular score (${extra}/10) → ${extraScore} points boost.`;

  // Final Calculation
  let matchScore = gpaScore + langScore + countryScore + fieldScore + degreeScore + docScore + extraScore;

  if (missingDocs.length > 0) {
    if (matchScore > 60) matchScore = 60;
    docReason += " Score capped at 60 due to missing documents.";
  }

  if (strictFail) {
    matchScore = 0;
  }

  let category: "Fully Eligible" | "Partially Eligible" | "Not Eligible" = "Not Eligible";
  if (matchScore >= 90) category = "Fully Eligible";
  else if (matchScore >= 60) category = "Partially Eligible";

  return {
    scholarshipId: scholarship.id,
    userId: user.profile.userId,
    matchScore: Math.round(matchScore),
    category,
    breakdown: {
      gpa: Math.round(gpaScore),
      language: Math.round(langScore),
      country: Math.round(countryScore),
      field: Math.round(fieldScore),
      degree: Math.round(degreeScore),
      documents: Math.round(docScore),
      extracurricular: Math.round(extraScore)
    },
    reasoning: [
      gpaReason,
      langReason,
      countryReason,
      fieldReason,
      degreeReason,
      docReason,
      extraReason
    ],
    flags: {
      strictFail,
      missingDocuments: missingDocs,
      blockedApplication
    }
  };
}

export type ImprovementItem = {
  gap: string;
  currentValue: string;
  targetValue: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  impactPoints: number;
  action: string;
  timeEstimate: string;
  category: 'gpa' | 'language' | 'research' | 'documents' | 'extracurricular' | 'field' | 'degree';
};

/**
 * Generate a prioritized list of improvements the student can make
 * to increase their match score for a specific scholarship.
 */
export function generateImprovements(user: UserProfileData, scholarship: Scholarship): ImprovementItem[] {
  const items: ImprovementItem[] = [];

  // 1. GPA Gap
  let userGpa: number | null = null;
  if (scholarship.degreeLevel === "MASTERS" || scholarship.degreeLevel === "PHD") {
    userGpa = user.profile.undergraduateCgpa || user.profile.graduateCgpa || user.profile.hscGpa;
  } else if (scholarship.degreeLevel === "UNDERGRADUATE") {
    userGpa = user.profile.hscGpa || user.profile.sscGpa;
  } else {
    userGpa = user.profile.undergraduateCgpa || user.profile.hscGpa || user.profile.sscGpa;
  }
  if (!userGpa) {
    items.push({
      gap: 'GPA not recorded in profile',
      currentValue: 'Not set',
      targetValue: scholarship.requiredGPA ? `${scholarship.requiredGPA}+` : 'Any',
      impact: 'critical',
      impactPoints: 30,
      action: 'Update your profile with your current GPA — this is required to be considered eligible.',
      timeEstimate: '5 minutes',
      category: 'gpa',
    });
  } else if (scholarship.requiredGPA && userGpa < scholarship.requiredGPA) {
    const gap = scholarship.requiredGPA - userGpa;
    items.push({
      gap: `GPA below requirement (${userGpa.toFixed(2)} < ${scholarship.requiredGPA.toFixed(2)})`,
      currentValue: `${userGpa.toFixed(2)}`,
      targetValue: `${scholarship.requiredGPA.toFixed(2)}+`,
      impact: scholarship.strictGpa ? 'critical' : gap > 0.3 ? 'high' : 'medium',
      impactPoints: Math.round((gap / scholarship.requiredGPA) * 30),
      action: `Retake any failed modules, apply for grade appeal, or supplement with a strong research project to demonstrate academic capability above your transcript GPA.`,
      timeEstimate: '1–2 semesters',
      category: 'gpa',
    });
  }

  // 2. Language Gap
  const userIelts = user.testScores?.ielts;
  const userToefl = user.testScores?.toefl;
  const reqIelts = scholarship.requiredIELTS;
  const reqToefl = scholarship.requiredTOEFL;
  if (!userIelts && !userToefl && (reqIelts || reqToefl)) {
    items.push({
      gap: 'No language test score',
      currentValue: 'Not taken',
      targetValue: reqIelts ? `IELTS ${reqIelts}` : `TOEFL ${reqToefl}`,
      impact: scholarship.strictLanguage ? 'critical' : 'high',
      impactPoints: 20,
      action: `Register for IELTS or TOEFL immediately. Prepare for 2–3 months using official materials. Aim for ${reqIelts ? `IELTS ${reqIelts}` : `TOEFL ${reqToefl}`} or higher.`,
      timeEstimate: '2–3 months',
      category: 'language',
    });
  } else if (userIelts && reqIelts && userIelts < reqIelts) {
    const gap = reqIelts - userIelts;
    items.push({
      gap: `IELTS below requirement (${userIelts} < ${reqIelts})`,
      currentValue: `IELTS ${userIelts}`,
      targetValue: `IELTS ${reqIelts}`,
      impact: scholarship.strictLanguage ? 'critical' : gap > 0.5 ? 'high' : 'medium',
      impactPoints: Math.round((gap / reqIelts) * 20),
      action: `Retake IELTS focusing on your weakest bands. A boost of ${gap.toFixed(1)} is achievable with 6–8 weeks of targeted practice on writing and speaking.`,
      timeEstimate: '6–8 weeks',
      category: 'language',
    });
  }

  // 3. Missing Documents
  const userDocs = user.documents.map(d => d.type.toLowerCase());
  const hasCv = userDocs.includes("cv") || userDocs.includes("resume");
  const hasSop = userDocs.includes("sop") || userDocs.includes("statement of purpose");
  const hasPassport = userDocs.includes("passport");
  if (!hasPassport) {
    items.push({
      gap: 'No passport on file',
      currentValue: 'Missing',
      targetValue: 'Valid passport',
      impact: 'critical',
      impactPoints: 4,
      action: 'Apply for a passport immediately — required for all international applications and visa processing.',
      timeEstimate: '2–4 weeks',
      category: 'documents',
    });
  }
  if (!hasCv) {
    items.push({
      gap: 'No CV/Resume uploaded',
      currentValue: 'Missing',
      targetValue: 'Academic CV uploaded',
      impact: 'high',
      impactPoints: 3,
      action: 'Create a scholarship-focused academic CV highlighting your GPA, research, awards, and leadership. Use a clean, ATS-friendly format.',
      timeEstimate: '1–3 days',
      category: 'documents',
    });
  }
  if (!hasSop) {
    items.push({
      gap: 'No Statement of Purpose',
      currentValue: 'Missing',
      targetValue: 'SOP uploaded',
      impact: 'high',
      impactPoints: 3,
      action: `Write a tailored SOP for ${scholarship.title} explaining your academic background, research interests, career goals, and why this scholarship aligns with your mission.`,
      timeEstimate: '1–2 weeks',
      category: 'documents',
    });
  }

  // 4. Research & Extracurricular
  const extra = user.profile.extracurricularScore || 0;
  if (extra < 5) {
    const countryNeedsResearch = ['Germany', 'Japan', 'South Korea', 'Sweden', 'Netherlands', 'Switzerland'].includes(scholarship.country);
    if (!user.profile.researchExperience && !user.profile.publications) {
      items.push({
        gap: 'No research experience',
        currentValue: 'None',
        targetValue: 'At least 1 project or publication',
        impact: countryNeedsResearch ? 'high' : 'medium',
        impactPoints: countryNeedsResearch ? 5 : 3,
        action: `Contact professors in your department about joining a lab or research project. Even a semester-long contribution significantly boosts your competitiveness for ${scholarship.country}-based scholarships.`,
        timeEstimate: '1–3 months',
        category: 'research',
      });
    }
    if (!user.profile.leadership && !user.profile.volunteerExperience) {
      items.push({
        gap: 'No leadership or volunteer experience',
        currentValue: 'None',
        targetValue: 'Active community role',
        impact: 'medium',
        impactPoints: 2,
        action: 'Join a student club in a leadership capacity, volunteer with an NGO, or organise a community event. Document your role, hours contributed, and measurable impact.',
        timeEstimate: '1–3 months',
        category: 'extracurricular',
      });
    }
  }

  // 5. Field mismatch
  const userField = user.careerGoal?.studyField?.toLowerCase() || "";
  const eligibleFields = Array.isArray(scholarship.fieldsOfStudy) ? (scholarship.fieldsOfStudy as string[]).map(f => f.toLowerCase()) : [];
  if (eligibleFields.length > 0 && userField && !eligibleFields.some(f => f.includes(userField) || userField.includes(f))) {
    items.push({
      gap: `Study field mismatch (your field: ${userField})`,
      currentValue: userField || 'Not set',
      targetValue: eligibleFields.join(' / '),
      impact: 'high',
      impactPoints: 15,
      action: `This scholarship targets ${eligibleFields.join(', ')}. Consider whether you can align your thesis or research proposal with these fields, or search for scholarships in ${userField || 'your specific field'}.`,
      timeEstimate: 'Reassess',
      category: 'field',
    });
  }

  const impactOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return items.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
}

