/**
 * Experience & Seniority Alignment Engine (Milestone 6)
 * Calculates candidate experience years, role relevance, & seniority compatibility.
 */

import { UnifiedParsedResume } from "../parser/resume-parser";
import { StructuredJobDescription, SeniorityLevel } from "../types";

export interface ExperienceMatchResult {
  totalYearsCandidate: number;
  relevantYearsCandidate: number;
  isMinYearsSatisfied: boolean;
  seniorityAlignmentScore: number; // 0-100
  experienceScore: number; // 0-100
  evidenceText?: string;
  notes: string[];
}

export function evaluateExperienceRelevance(
  resume: UnifiedParsedResume,
  jd: StructuredJobDescription
): ExperienceMatchResult {
  const notes: string[] = [];

  // Calculate total candidate experience years from dates or experience items
  let totalYearsCandidate = 0;
  resume.experiences.forEach((exp) => {
    const startYear = parseInt(exp.startDate.match(/\d{4}/)?.[0] || "2022", 10);
    const endYear = exp.endDate.toLowerCase().includes("present")
      ? new Date().getFullYear()
      : parseInt(exp.endDate.match(/\d{4}/)?.[0] || `${startYear + 1}`, 10);

    const diff = Math.max(1, endYear - startYear);
    totalYearsCandidate += diff;
  });

  if (resume.experiences.length > 0 && totalYearsCandidate === 0) {
    totalYearsCandidate = resume.experiences.length * 1.5;
  }

  const isMinYearsSatisfied = totalYearsCandidate >= jd.minYearsExperience;

  // Evaluate Seniority Alignment
  let seniorityAlignmentScore = 85;
  const candidateSeniority = detectCandidateSeniority(resume, totalYearsCandidate);

  if (jd.seniority === "SENIOR" && (candidateSeniority === "STUDENT" || candidateSeniority === "ENTRY_LEVEL")) {
    seniorityAlignmentScore = 45;
    notes.push(`Target role requires Senior level background, candidate has ${totalYearsCandidate} years experience.`);
  } else if (jd.seniority === "MID_LEVEL" && candidateSeniority === "STUDENT") {
    seniorityAlignmentScore = 65;
    notes.push(`Target role requires Mid-level experience.`);
  } else {
    seniorityAlignmentScore = 95;
    notes.push(`Seniority level (${candidateSeniority}) is compatible with job requirement (${jd.seniority}).`);
  }

  // Calculate Experience Relevance Score
  let experienceScore = 70;
  if (isMinYearsSatisfied) {
    experienceScore += 25;
  } else {
    const ratio = totalYearsCandidate / Math.max(1, jd.minYearsExperience);
    experienceScore = Math.round(ratio * 75);
  }

  experienceScore = Math.min(100, Math.max(20, experienceScore));

  const bestExp = resume.experiences[0];
  const evidenceText = bestExp
    ? `${bestExp.role} at ${bestExp.company} (${bestExp.startDate} - ${bestExp.endDate})`
    : `Candidate has ${totalYearsCandidate} total years of experience across ${resume.experiences.length} positions.`;

  return {
    totalYearsCandidate,
    relevantYearsCandidate: totalYearsCandidate,
    isMinYearsSatisfied,
    seniorityAlignmentScore,
    experienceScore,
    evidenceText,
    notes,
  };
}

function detectCandidateSeniority(resume: UnifiedParsedResume, totalYears: number): SeniorityLevel {
  if (totalYears === 0 && resume.experiences.length === 0) return "STUDENT";
  if (totalYears < 2) return "ENTRY_LEVEL";
  if (totalYears >= 5) return "SENIOR";
  return "MID_LEVEL";
}
