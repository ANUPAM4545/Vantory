/**
 * Job Description Requirement Extraction Engine (Milestone 6)
 * Distinguishes REQUIRED vs PREFERRED requirements & assigns criticality weights.
 */

import { StructuredJobDescription, ExtractedRequirement } from "../types";
import { normalizeJobTitle, detectSeniorityLevel } from "../taxonomy/titles";
import { CANONICAL_SKILL_MAP } from "../taxonomy/skills";

export function parseJobDescription(rawJdText: string, providedTitle?: string): StructuredJobDescription {
  const text = rawJdText.trim();
  const title = providedTitle || extractJobTitleFromJd(text);
  const normalizedTitle = normalizeJobTitle(title);
  const seniority = detectSeniorityLevel(`${title} ${text}`);
  const minYears = extractMinYearsExperience(text);

  const { requiredSkills, preferredSkills } = extractSkillsFromJd(text);
  const requirements = extractStructuredRequirements(text, requiredSkills, preferredSkills, minYears);

  let workMode: "REMOTE" | "HYBRID" | "ON_SITE" | "UNKNOWN" = "UNKNOWN";
  if (/\b(remote|work from home|telecommute)\b/i.test(text)) workMode = "REMOTE";
  else if (/\b(hybrid|flexible)\b/i.test(text)) workMode = "HYBRID";
  else if (/\b(on-site|onsite|in-office|in office)\b/i.test(text)) workMode = "ON_SITE";

  return {
    title,
    normalizedTitle,
    companyName: extractCompanyNameFromJd(text),
    seniority,
    location: extractLocationFromJd(text),
    workMode,
    minYearsExperience: minYears,
    requiredSkills,
    preferredSkills,
    requirements,
    educationRequirement: extractEducationRequirement(text),
    rawText: text,
  };
}

function extractJobTitleFromJd(text: string): string {
  const firstLine = text.split("\n")[0]?.trim() || "";
  if (firstLine.length > 5 && firstLine.length < 80 && !firstLine.includes(".")) {
    return firstLine;
  }
  const match = text.match(/(?:Job Title|Role|Position)\s*[:|-]\s*([^\n\r]+)/i);
  if (match) return match[1].trim();
  return "Software Engineer";
}

function extractCompanyNameFromJd(text: string): string | undefined {
  const match = text.match(/(?:Company|About|At)\s*[:|-]\s*([^\n\r.]+)/i);
  if (match && match[1].trim().length < 40) return match[1].trim();
  return undefined;
}

function extractLocationFromJd(text: string): string | undefined {
  const match = text.match(/(?:Location|Based in|Office)\s*[:|-]\s*([^\n\r.]+)/i);
  if (match) return match[1].trim();
  return undefined;
}

function extractMinYearsExperience(text: string): number {
  const match = text.match(/(\d+)\s*\+\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i) ||
                text.match(/(?:at least|minimum|with)\s+(\d+)\s*(?:years?|yrs?)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (/senior|sr\./i.test(text)) return 5;
  if (/junior|entry/i.test(text)) return 1;
  return 2;
}

function extractEducationRequirement(text: string): string | undefined {
  const match = text.match(/(?:bachelor|master|phd|b\.tech|b\.e\.|bs|ms|degree)\s+in\s+([^\n\r.]+)/i);
  if (match) return match[0].trim();
  if (/bachelor/i.test(text)) return "Bachelor's Degree in Computer Science or related field";
  return undefined;
}

function extractSkillsFromJd(text: string): { requiredSkills: string[]; preferredSkills: string[] } {
  const required: string[] = [];
  const preferred: string[] = [];

  const lower = text.toLowerCase();
  const preferredSectionMatch = text.match(/(?:preferred|nice to have|bonus|plus)\s*[:|-]?([\s\S]*?)(?=(?:requirements|qualifications|responsibilities|$))/i);
  const preferredText = preferredSectionMatch ? preferredSectionMatch[1].toLowerCase() : "";

  Object.keys(CANONICAL_SKILL_MAP).forEach((key) => {
    const canonicalName = CANONICAL_SKILL_MAP[key];
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = /^\w/.test(key) && /\w$/.test(key)
      ? new RegExp(`\\b${safeKey}\\b`, "i")
      : new RegExp(`(?:^|\\s|[^a-zA-Z0-9])${safeKey}(?:$|\\s|[^a-zA-Z0-9])`, "i");

    if (reg.test(lower)) {
      if (preferredText && reg.test(preferredText)) {
        if (!preferred.includes(canonicalName)) preferred.push(canonicalName);
      } else {
        if (!required.includes(canonicalName)) required.push(canonicalName);
      }
    }
  });

  return { requiredSkills: required, preferredSkills: preferred };
}

function extractStructuredRequirements(
  text: string,
  requiredSkills: string[],
  preferredSkills: string[],
  minYears: number
): ExtractedRequirement[] {
  const reqs: ExtractedRequirement[] = [];

  // Minimum Experience Requirement
  if (minYears > 0) {
    reqs.push({
      id: "req-exp",
      name: `${minYears}+ Years Relevant Experience`,
      category: "experience",
      type: "REQUIRED",
      importance: "CRITICAL",
      minYears,
      originalText: `${minYears}+ years experience required`,
    });
  }

  // Required Skills
  requiredSkills.forEach((skill, idx) => {
    reqs.push({
      id: `req-skill-${idx}`,
      name: skill,
      category: "skill",
      type: "REQUIRED",
      importance: idx < 3 ? "CRITICAL" : "HIGH",
      originalText: `Proficiency in ${skill}`,
    });
  });

  // Preferred Skills
  preferredSkills.forEach((skill, idx) => {
    reqs.push({
      id: `pref-skill-${idx}`,
      name: skill,
      category: "skill",
      type: "PREFERRED",
      importance: "MEDIUM",
      originalText: `Experience with ${skill} is a plus`,
    });
  });

  return reqs;
}
