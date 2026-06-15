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
