/**
 * Education Matching Engine (Milestone 6)
 * Evaluates candidate degree, major, & equivalent field of study.
 */

import { UnifiedParsedResume } from "../parser/resume-parser";
import { StructuredJobDescription } from "../types";

export interface EducationMatchResult {
  isSatisfied: boolean;
  score: number; // 0-100
  degreeFound?: string;
  institutionFound?: string;
  evidenceText?: string;
  notes: string;
}

export function evaluateEducationMatch(
  resume: UnifiedParsedResume,
  jd: StructuredJobDescription
): EducationMatchResult {
  if (resume.education.length === 0) {
    return {
      isSatisfied: false,
      score: 50,
      notes: "No education entries listed on resume.",
    };
  }

  const primaryEdu = resume.education[0];
  const degreeText = `${primaryEdu.degree} in ${primaryEdu.fieldOfStudy || "Computer Science"}`;

  let score = 90;
  let isSatisfied = true;
  let notes = `Candidate holds ${degreeText} from ${primaryEdu.institution || "University"}.`;

  const lowerEdu = `${primaryEdu.degree} ${primaryEdu.fieldOfStudy}`.toLowerCase();

  if (/\b(bachelor|b\.tech|b\.e\.|bs|master|ms|m\.tech|phd)\b/.test(lowerEdu)) {
    score = 100;
    isSatisfied = true;
  } else if (jd.educationRequirement && !/computer science|engineering|technology/i.test(lowerEdu)) {
    score = 75;
    notes = `Candidate degree is in a non-STEM field, but education requirement is partially satisfied.`;
  }

  return {
    isSatisfied,
    score,
    degreeFound: primaryEdu.degree,
    institutionFound: primaryEdu.institution,
    evidenceText: `${degreeText} — ${primaryEdu.institution}`,
    notes,
  };
}
