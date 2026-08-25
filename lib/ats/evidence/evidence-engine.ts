/**
 * Evidence Engine for Vantory AI Resume ATS Engine (v2.1)
 * Scans candidate experience, projects, summary, & skills sections
 * to extract exact supporting evidence text snippets and classify evidence levels
 * as STRONG, MODERATE, WEAK, or MISSING.
 */

import { UnifiedParsedResume } from "../parser/resume-parser";
import { MatchedSkillEvidence, MatchedRequirementEvidence, RequirementStatus, EvidenceLevel } from "../types";
import { evaluateSkillMatch } from "../taxonomy/skills";

export interface EvidenceExtractionResult {
  skillsTable: MatchedSkillEvidence[];
  requirementsTable: MatchedRequirementEvidence[];
  strengths: string[];
  gaps: string[];
}

export function extractEvidence(
  resume: UnifiedParsedResume,
  requiredSkills: string[],
  preferredSkills: string[],
  minYearsRequired: number
): EvidenceExtractionResult {
  const skillsTable: MatchedSkillEvidence[] = [];
  const requirementsTable: MatchedRequirementEvidence[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];

  // 1. Process Required Skills
  requiredSkills.forEach((reqSkill) => {
    const match = evaluateSkillMatch(reqSkill, resume.skills);
    const evidence = findTextSnippetForSkill(reqSkill, resume);

    let evidenceLevel: EvidenceLevel = "MISSING";
    if (match.matchType === "NOT_FOUND") {
      evidenceLevel = "MISSING";
    } else if (evidence?.section === "Experience" || evidence?.section === "Projects") {
      evidenceLevel = "STRONG";
    } else if (evidence?.section === "Certifications" || evidence?.section === "Coursework") {
      evidenceLevel = "MODERATE";
    } else {
      evidenceLevel = "WEAK"; // Only in Skills list
    }

    let confidence = match.confidence;
    if (evidenceLevel === "STRONG") confidence = Math.min(100, confidence + 10);
    if (evidenceLevel === "WEAK") confidence = Math.max(50, confidence - 15);

    const item: MatchedSkillEvidence = {
      skillName: reqSkill,
      normalizedSkill: reqSkill,
      matchType: match.matchType,
      evidenceLevel,
      requirementType: "REQUIRED",
      importance: "HIGH",
      evidenceText: evidence?.snippet || (match.matchType !== "NOT_FOUND" ? `Listed in Skills section only` : undefined),
      sourceSection: evidence?.section || (match.matchType !== "NOT_FOUND" ? "Skills" : undefined),
      sourceEntity: evidence?.entity,
      confidence,
    };

    skillsTable.push(item);

    if (evidenceLevel === "STRONG") {
      strengths.push(`Strong ${reqSkill} evidence found in ${evidence?.section} (${evidence?.entity || ""})`);
    } else if (evidenceLevel === "WEAK") {
      gaps.push(`Skill ${reqSkill} is listed in Skills section but lacks contextual experience evidence.`);
    } else if (match.matchType === "NOT_FOUND") {
      gaps.push(`Required skill ${reqSkill} not found anywhere in resume.`);
    } else if (match.matchType === "RELATED") {
      gaps.push(`Related skill ${match.matchedSkillName} found, but ${reqSkill} was not explicitly demonstrated.`);
    }
  });

  // 2. Process Preferred Skills
  preferredSkills.forEach((prefSkill) => {
    const match = evaluateSkillMatch(prefSkill, resume.skills);
    const evidence = findTextSnippetForSkill(prefSkill, resume);

    let evidenceLevel: EvidenceLevel = "MISSING";
    if (match.matchType === "NOT_FOUND") {
      evidenceLevel = "MISSING";
    } else if (evidence?.section === "Experience" || evidence?.section === "Projects") {
      evidenceLevel = "STRONG";
    } else if (evidence?.section === "Certifications") {
      evidenceLevel = "MODERATE";
    } else {
      evidenceLevel = "WEAK";
    }

    const item: MatchedSkillEvidence = {
      skillName: prefSkill,
      normalizedSkill: prefSkill,
      matchType: match.matchType,
      evidenceLevel,
      requirementType: "PREFERRED",
      importance: "MEDIUM",
      evidenceText: evidence?.snippet || (match.matchType !== "NOT_FOUND" ? `Listed in Skills section` : undefined),
      sourceSection: evidence?.section || (match.matchType !== "NOT_FOUND" ? "Skills" : undefined),
      sourceEntity: evidence?.entity,
      confidence: match.confidence,
    };

    skillsTable.push(item);

    if (evidenceLevel === "STRONG" || evidenceLevel === "MODERATE") {
      strengths.push(`Preferred skill ${prefSkill} demonstrated in ${evidence?.section || "Skills"}.`);
    }
  });

  // 3. Process Requirements Table
  // Experience Requirement
  const totalExp = resume.experiences.length * 1.5;
  const expStatus: RequirementStatus = totalExp >= minYearsRequired ? "SATISFIED" : "PARTIAL";

  requirementsTable.push({
    requirementId: "req-exp-years",
    requirementName: `${minYearsRequired}+ Years Relevant Experience`,
    type: "REQUIRED",
    importance: "CRITICAL",
    status: expStatus,
    evidenceText: resume.experiences[0]
      ? `${resume.experiences[0].role} at ${resume.experiences[0].company}`
      : `${totalExp} years total experience found`,
    sourceSection: "Experience",
    sourceEntity: resume.experiences[0]?.company,
    confidence: 95,
  });

  // Education Requirement
  requirementsTable.push({
    requirementId: "req-edu",
    requirementName: "Degree in Computer Science or Related Field",
    type: "REQUIRED",
    importance: "HIGH",
    status: resume.education.length > 0 ? "SATISFIED" : "MISSING",
    evidenceText: resume.education[0]
      ? `${resume.education[0].degree} in ${resume.education[0].fieldOfStudy || "CS"} — ${resume.education[0].institution}`
      : undefined,
    sourceSection: "Education",
    sourceEntity: resume.education[0]?.institution,
    confidence: 90,
  });

  return {
    skillsTable,
    requirementsTable,
    strengths,
    gaps,
  };
}

function findTextSnippetForSkill(
  skill: string,
  resume: UnifiedParsedResume
): { snippet: string; section: string; entity?: string } | undefined {
  const skillLower = skill.toLowerCase();

  // Check Experience bullets
  for (const exp of resume.experiences) {
    for (const bullet of exp.bullets) {
      if (bullet.toLowerCase().includes(skillLower)) {
        return {
          snippet: bullet,
          section: "Experience",
          entity: `${exp.role} at ${exp.company}`,
        };
      }
    }
  }

  // Check Project bullets
  for (const proj of resume.projects) {
    for (const bullet of proj.bullets) {
      if (bullet.toLowerCase().includes(skillLower)) {
        return {
          snippet: bullet,
          section: "Projects",
          entity: proj.title,
        };
      }
    }
    if (proj.techStack.some((t) => t.toLowerCase() === skillLower)) {
      return {
        snippet: `Project ${proj.title} built using ${proj.techStack.join(", ")}`,
        section: "Projects",
        entity: proj.title,
      };
    }
  }

  // Check Certifications
  for (const cert of resume.certifications) {
    if (cert.toLowerCase().includes(skillLower)) {
      return {
        snippet: `Certification: ${cert}`,
        section: "Certifications",
        entity: cert,
      };
    }
  }

  // Check Summary
  if (resume.summary && resume.summary.toLowerCase().includes(skillLower)) {
    return {
      snippet: resume.summary,
      section: "Summary",
    };
  }

  return undefined;
}
