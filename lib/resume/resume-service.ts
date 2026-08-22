import { db } from "@/lib/db";
import { ResumeData, defaultResumeSettings } from "./types";
import { parseResumeContent, serializeResumeContent } from "./serialization";

/**
 * Pre-populates structured ResumeData from Candidate's Profile records in database.
 */
export async function autoPopulateFromProfile(userId: string): Promise<ResumeData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user || !user.profile) {
    return {
      title: "Candidate Resume",
      personalInfo: {
        fullName: user?.name || "Candidate",
        headline: "Software Engineer",
        email: user?.email || "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
        leetcode: "",
      },
      summary: "",
      skills: [
        { id: "cat-1", category: "Languages", skills: ["Python", "JavaScript", "TypeScript", "SQL"] },
        { id: "cat-2", category: "Full-Stack", skills: ["React.js", "Next.js", "Node.js", "Tailwind CSS"] },
        { id: "cat-3", category: "Databases & Tools", skills: ["PostgreSQL", "SQLite", "Git", "Docker"] },
      ],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      settings: defaultResumeSettings,
    };
  }

  const p = user.profile;

  // Parse skills from Profile
  const profileSkills = p.skills
    ? p.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : ["Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker"];

  const skillsList = [
    {
      id: "cat-1",
      category: "Technical Skills",
      skills: profileSkills,
    },
  ];

  return {
    title: `${user.name} Resume`,
    personalInfo: {
      fullName: user.name,
      headline: p.headline || "Software Engineer",
      email: user.email,
      phone: p.phone || "",
      location: p.location || "",
      linkedin: p.linkedinUrl || "",
      github: p.githubUrl || "",
      portfolio: p.portfolioUrl || "",
      leetcode: "",
    },
    summary: p.bio || "Passionate Software Engineer dedicated to building high-performance web applications and scalable solutions.",
    skills: skillsList,
    experience: [
      {
        id: "exp-1",
        role: p.headline || "Software Engineer",
        company: "Tech Corp",
        location: p.location || "Remote",
        startDate: "2023",
        endDate: "Present",
        isCurrent: true,
        description: "Built scalable web features and API microservices.",
        bullets: [
          "Architected high-throughput microservices reducing response latency by 30%.",
          "Collaborated across cross-functional engineering teams to launch user-facing products.",
        ],
      },
    ],
    education: p.education
      ? [
          {
            id: "edu-1",
            degree: p.education,
            institution: "University",
            location: "",
            startDate: "2019",
            endDate: "2023",
          },
        ]
      : [],
    projects: [],
    certifications: [],
    achievements: [],
    settings: defaultResumeSettings,
  };
}

/**
 * Gets all resumes belonging to an authenticated candidate.
 */
export async function getCandidateResumes(userId: string) {
  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (resumes.length === 0) {
    // Auto-create initial default resume if candidate has none
    const initialData = await autoPopulateFromProfile(userId);
    const created = await db.resume.create({
      data: {
        userId,
        title: initialData.title,
        templateId: initialData.settings.templateId,
        contentJson: serializeResumeContent(initialData),
      },
    });

    return [created];
  }

  return resumes;
}

/**
 * Gets or creates default active resume for candidate.
 */
export async function getOrCreateDefaultResume(userId: string) {
  const userResumes = await getCandidateResumes(userId);
  const activeResume = userResumes[0];

  return {
    resumeId: activeResume.id,
    resumeData: parseResumeContent(activeResume.contentJson),
    title: activeResume.title,
    updatedAt: activeResume.updatedAt,
  };
}

/**
 * Saves/Updates resume content JSON.
 */
export async function saveResumeContent(
  userId: string,
  resumeId: string,
  data: ResumeData
) {
  const existing = await db.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!existing) {
    throw new Error("Resume not found or unauthorized.");
  }

  const updated = await db.resume.update({
    where: { id: resumeId },
    data: {
      title: data.title || existing.title,
      templateId: data.settings?.templateId || existing.templateId,
      contentJson: serializeResumeContent(data),
      updatedAt: new Date(),
    },
  });

  return updated;
}

export async function saveCandidateResume(userId: string, data: { resumeId?: string; content?: ResumeData }) {
  const userResumes = await getCandidateResumes(userId);
  const targetId = data.resumeId || userResumes[0].id;
  const content = data.content || (data as unknown as ResumeData);
  return saveResumeContent(userId, targetId, content);
}

