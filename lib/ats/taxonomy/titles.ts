/**
 * Job Title & Seniority Classification Engine (Milestone 6)
 */

import { SeniorityLevel } from "../types";

export function normalizeJobTitle(title: string): string {
  if (!title) return "Software Engineer";
  
  let cleaned = title.trim().replace(/\s+/g, " ");

  // Remove common prefix/suffix noise
  cleaned = cleaned.replace(/^(hiring for|seeking|looking for|opening for)\s+/i, "");
  cleaned = cleaned.replace(/\s+-\s+full time$/i, "");

  if (/backend/i.test(cleaned) && /engineer|developer/i.test(cleaned)) {
    return "Backend Engineer";
  }
  if (/frontend/i.test(cleaned) && /engineer|developer/i.test(cleaned)) {
    return "Frontend Engineer";
  }
  if (/fullstack|full stack/i.test(cleaned) && /engineer|developer/i.test(cleaned)) {
    return "Full Stack Engineer";
  }
  if (/devops|cloud|infrastructure/i.test(cleaned)) {
    return "DevOps Engineer";
  }
  if (/ai|machine learning|ml|data scientist/i.test(cleaned)) {
    return "AI / Machine Learning Engineer";
  }

  return cleaned;
}

export function detectSeniorityLevel(text: string): SeniorityLevel {
  const t = text.toLowerCase();

  if (/\b(intern|internship|trainee|fresher|student)\b/.test(t)) {
    return "STUDENT";
  }
  if (/\b(entry level|junior|jr|associate|0-1 year|0-2 year)\b/.test(t)) {
    return "ENTRY_LEVEL";
  }
  if (/\b(senior|sr|5\+ year|6\+ year|7\+ year|lead|principal|staff)\b/.test(t)) {
    if (/\b(principal|staff)\b/.test(t)) return "STAFF";
    if (/\b(lead|team lead)\b/.test(t)) return "LEAD";
    return "SENIOR";
  }
  if (/\b(manager|head of|director|vp)\b/.test(t)) {
    if (/\b(director|vp)\b/.test(t)) return "DIRECTOR";
    return "MANAGER";
  }

  return "MID_LEVEL"; // Default
}
