import { ResumeData, defaultResumeSettings, emptyResumeData } from "./types";

/**
 * Safely parses stringified JSON content into structured ResumeData with fallback defaults.
 */
export function parseResumeContent(jsonString: string | null | undefined): ResumeData {
  if (!jsonString) return emptyResumeData;

  try {
    const parsed = JSON.parse(jsonString);
    return {
      title: parsed.title || "Candidate Resume",
      personalInfo: {
        fullName: parsed.personalInfo?.fullName ?? "",
        headline: parsed.personalInfo?.headline ?? "Software Engineer",
        email: parsed.personalInfo?.email ?? "",
        phone: parsed.personalInfo?.phone ?? "",
        location: parsed.personalInfo?.location ?? "",
        linkedin: parsed.personalInfo?.linkedin ?? "",
        github: parsed.personalInfo?.github ?? "",
        portfolio: parsed.personalInfo?.portfolio ?? "",
        leetcode: parsed.personalInfo?.leetcode ?? "",
      },
      summary: parsed.summary ?? "",
      settings: {
        ...defaultResumeSettings,
        ...(parsed.settings || {}),
        sectionVisibility: {
          ...defaultResumeSettings.sectionVisibility,
          ...(parsed.settings?.sectionVisibility || {}),
        },
      },
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    };
  } catch {
    return emptyResumeData;
  }
}

/**
 * Serializes structured ResumeData object into JSON string for database persistence.
 */
export function serializeResumeContent(data: ResumeData): string {
  return JSON.stringify(data);
}
