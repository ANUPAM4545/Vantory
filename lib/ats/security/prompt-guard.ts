/**
 * Prompt Guard for SkillAssociate ATS Checker (Milestone 6)
 * Sanitizes job description & resume text inputs to prevent prompt injection attacks.
 */

export function sanitizeJdInput(text: string): string {
  if (!text) return "";

  // Strip control characters & null bytes
  let cleaned = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  // Escape any attempted system instruction markers so AI engines treat them strictly as plain text
  cleaned = cleaned
    .replace(/<system>/gi, "[system]")
    .replace(/<\/system>/gi, "[/system]")
    .replace(/<instruction>/gi, "[instruction]")
    .replace(/<\/instruction>/gi, "[/instruction]");

  return cleaned.trim();
}
