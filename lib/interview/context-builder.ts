import { CandidateIntelligenceProfile, InterviewSetupConfig } from "./types";
import { parseJobDescription } from "../ats/parser/job-parser";
import { parsePlainTextResume } from "../ats/parser/resume-parser";

export async function buildInterviewContext(
  config: InterviewSetupConfig,
  resumeContentJson?: string,
  atsSnapshotJson?: string
): Promise<CandidateIntelligenceProfile> {
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];
  const extractedExperience: string[] = [];
  const extractedProjects: Array<{ title: string; description?: string; techStack?: string[] }> = [];
  const resumeEvidenceSnippets: string[] = [];
  const weakAreas: string[] = [];
  const strongAreas: string[] = [];

  // Re-use structured ATS Scan report if available
  if (atsSnapshotJson) {
    try {
      const snapshot = JSON.parse(atsSnapshotJson);
      if (snapshot.skillsTable && Array.isArray(snapshot.skillsTable)) {
        snapshot.skillsTable.forEach((item: { skillName: string; requirementType?: string; evidenceLevel?: string; evidenceText?: string }) => {
          if (item.requirementType === "REQUIRED") {
            requiredSkills.push(item.skillName);
          } else {
            preferredSkills.push(item.skillName);
          }

          if (item.evidenceLevel === "STRONG" || item.evidenceLevel === "MODERATE") {
            strongAreas.push(item.skillName);
            if (item.evidenceText) resumeEvidenceSnippets.push(item.evidenceText);
          } else if (item.evidenceLevel === "MISSING" || item.evidenceLevel === "WEAK") {
            weakAreas.push(item.skillName);
          }
        });
      }

      if (snapshot.whyPointsLost && Array.isArray(snapshot.whyPointsLost)) {
        snapshot.whyPointsLost.forEach((d: { title: string; reason?: string }) => {
          weakAreas.push(d.title);
        });
      }
    } catch {
      // Fallback gracefully
    }
  }

  // Parse target job description
  if (requiredSkills.length === 0 && config.jobDescription) {
    const parsedJd = parseJobDescription(config.jobDescription, config.targetJobTitle);
    if (Array.isArray(parsedJd.requiredSkills)) {
      parsedJd.requiredSkills.forEach((s: string | { name: string }) => requiredSkills.push(typeof s === "string" ? s : s.name));
    }
    if (Array.isArray(parsedJd.preferredSkills)) {
      parsedJd.preferredSkills.forEach((s: string | { name: string }) => preferredSkills.push(typeof s === "string" ? s : s.name));
    }
  }

  // Parse saved resume data
  if (resumeContentJson) {
    try {
      const parsedResume = typeof resumeContentJson === "string" ? JSON.parse(resumeContentJson) : resumeContentJson;

      if (parsedResume.skills && Array.isArray(parsedResume.skills)) {
        parsedResume.skills.forEach((cat: { category: string; skills: string[] }) => {
          if (Array.isArray(cat.skills)) {
            cat.skills.forEach((s) => {
              if (!strongAreas.includes(s)) strongAreas.push(s);
            });
          }
        });
      }

      if (parsedResume.experience && Array.isArray(parsedResume.experience)) {
        parsedResume.experience.forEach((exp: { role: string; company: string; bullets?: string[] }) => {
          const expText = `${exp.role} at ${exp.company}`;
          extractedExperience.push(expText);
          if (exp.bullets && Array.isArray(exp.bullets)) {
            exp.bullets.forEach((b) => resumeEvidenceSnippets.push(b));
          }
        });
      }

      if (parsedResume.projects && Array.isArray(parsedResume.projects)) {
        parsedResume.projects.forEach((proj: { title: string; description?: string; techStack?: string[] }) => {
          extractedProjects.push({
            title: proj.title,
            description: proj.description,
            techStack: proj.techStack,
          });
        });
      }
    } catch {
      // Fallback plain text parse
      const parsed = parsePlainTextResume(resumeContentJson);
      if (Array.isArray(parsed.skills)) {
        parsed.skills.forEach((s: string | { name: string }) => {
          const skillName = typeof s === "string" ? s : s.name;
          if (skillName && !strongAreas.includes(skillName)) strongAreas.push(skillName);
        });
      }
      if (Array.isArray(parsed.experiences)) {
        parsed.experiences.forEach((e: { role: string; company: string }) => extractedExperience.push(`${e.role} at ${e.company}`));
      }
      if (Array.isArray(parsed.projects)) {
        parsed.projects.forEach((p: { title: string }) => extractedProjects.push({ title: p.title }));
      }
    }
  }

  // Fallback defaults if empty
  if (requiredSkills.length === 0) {
    requiredSkills.push("Software Engineering", "API Design", "Problem Solving");
  }
  if (extractedProjects.length === 0) {
    extractedProjects.push({ title: "Core Application Development", techStack: requiredSkills.slice(0, 3) });
  }

  return {
    resumeId: config.resumeId,
    targetJobTitle: config.targetJobTitle,
    companyName: config.companyName,
    jobDescription: config.jobDescription,
    requiredSkills: Array.from(new Set(requiredSkills)),
    preferredSkills: Array.from(new Set(preferredSkills)),
    extractedExperience: Array.from(new Set(extractedExperience)),
    extractedProjects,
    resumeEvidenceSnippets: Array.from(new Set(resumeEvidenceSnippets)),
    weakAreas: Array.from(new Set(weakAreas)),
    strongAreas: Array.from(new Set(strongAreas)),
  };
}
