/**
 * Critical Requirement Gate System (Milestone 6)
 * Detects dealbreaker missing requirements & prevents high keyword scores from hiding critical gaps.
 */

import { UnifiedParsedResume } from "../parser/resume-parser";
import { StructuredJobDescription, CriticalGap } from "../types";
import { evaluateSkillMatch } from "../taxonomy/skills";

export function evaluateCriticalGates(
  resume: UnifiedParsedResume,
  jd: StructuredJobDescription
): CriticalGap[] {
  const gaps: CriticalGap[] = [];

  // 1. Critical Experience Gap Gate
  let totalYears = 0;
  resume.experiences.forEach((exp) => {
    const startYear = parseInt(exp.startDate.match(/\d{4}/)?.[0] || "2022", 10);
    const endYear = exp.endDate.toLowerCase().includes("present")
      ? new Date().getFullYear()
      : parseInt(exp.endDate.match(/\d{4}/)?.[0] || `${startYear + 1}`, 10);
    totalYears += Math.max(1, endYear - startYear);
  });
  if (resume.experiences.length > 0 && totalYears === 0) totalYears = resume.experiences.length * 1.5;

  if (jd.minYearsExperience > 0 && totalYears < jd.minYearsExperience * 0.6) {
    gaps.push({
      title: "Critical Experience Gap",
      requirementName: `${jd.minYearsExperience}+ Years Experience`,
      requiredDetail: `Job requires at least ${jd.minYearsExperience}+ years of experience.`,
      resumeDetail: `Resume shows approximately ${totalYears} years total experience.`,
      impactDescription: "Significant reduction in candidate job match compatibility.",
      severity: "CRITICAL",
    });
  }

  // 2. Critical Mandatory Skills Gate
  const missingCriticalSkills: string[] = [];
  jd.requiredSkills.slice(0, 3).forEach((reqSkill) => {
    const match = evaluateSkillMatch(reqSkill, resume.skills);
    if (match.matchType === "NOT_FOUND") {
      missingCriticalSkills.push(reqSkill);
    }
  });

  if (missingCriticalSkills.length >= 2) {
    gaps.push({
      title: "Missing Critical Required Skills",
      requirementName: missingCriticalSkills.join(", "),
      requiredDetail: `Job explicitly requires ${missingCriticalSkills.join(", ")}.`,
      resumeDetail: `No explicit evidence detected in resume skills or experience sections.`,
      impactDescription: "Missing primary technical stack requirements.",
      severity: "HIGH",
    });
  }

  return gaps;
}
