export interface ResumePersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  leetcode: string;
}

export interface ResumeExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  bullets: string[];
}

export interface ResumeEducationItem {
  id: string;
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade?: string;
  coursework?: string;
}

export interface ResumeSkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface ResumeProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  bullets: string[];
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  pdfFileName?: string;
}

export interface ResumeAchievementItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  proofUrl?: string;
  pdfFileName?: string;
}

export type ResumeSectionId =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements";

export interface ResumeSettings {
  templateId: "classic-monochrome" | "latex-classic" | "latex-minimal";
  fontSize: "sm" | "md" | "lg";
  margins: "compact" | "normal" | "spacious";
  sectionOrder: ResumeSectionId[];
  sectionVisibility: Record<ResumeSectionId, boolean>;
}

export interface ResumeData {
  id?: string;
  title: string;
  personalInfo: ResumePersonalInfo;
  summary: string;
  skills: ResumeSkillCategory[];
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
  achievements: ResumeAchievementItem[];
  settings: ResumeSettings;
}

export const defaultResumeSettings: ResumeSettings = {
  templateId: "classic-monochrome",
  fontSize: "md",
  margins: "normal",
  sectionOrder: [
    "personal",
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "achievements",
  ],
  sectionVisibility: {
    personal: true,
    summary: true,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    certifications: true,
    achievements: true,
  },
};

export const emptyResumeData: ResumeData = {
  title: "Software Engineer Resume",
  personalInfo: {
    fullName: "Anupam Singh",
    headline: "Full Stack & Generative AI Engineer",
    email: "anupamsingh8095@gmail.com",
    phone: "7307679920",
    location: "Varanasi, India",
    linkedin: "https://linkedin.com/in/anupamsingh",
    github: "https://github.com/ANUPAM456",
    portfolio: "https://anupamsingh.dev",
    leetcode: "https://leetcode.com/anupamsingh",
  },
  summary:
    "Computer Science undergraduate specializing in Generative AI and full-stack engineering, with hands-on experience building multi-agent orchestration systems using LangChain, LangGraph, MCP tool integrations, and production-grade web applications across React, Next.js, and Node.js/Express.",
  skills: [
    {
      id: "sk-1",
      category: "Languages",
      skills: ["Python", "JavaScript", "TypeScript", "Java", "Go", "SQL"],
    },
    {
      id: "sk-2",
      category: "Generative AI & LLMs",
      skills: ["Large Language Models (LLMs)", "Multi-Agent Orchestration", "LangChain", "LangGraph", "Model Context Protocol (MCP)"],
    },
    {
      id: "sk-3",
      category: "Full-Stack Development",
      skills: ["React.js", "Next.js", "Tailwind CSS", "Node.js", "Express.js", "REST APIs", "Zustand"],
    },
    {
      id: "sk-4",
      category: "Databases & Tools",
      skills: ["MongoDB", "PostgreSQL", "SQLite", "Redis", "Docker", "Git", "GitHub Actions"],
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Software Engineer Intern",
      company: "SkillAssociate Technologies",
      location: "Bengaluru, India",
      startDate: "2024",
      endDate: "Present",
      isCurrent: true,
      description: "Building production campus placement engine and candidate preparation portal.",
      bullets: [
        "Architected real-time candidate ATS scoring and mock interview evaluation pipelines.",
        "Engineered scalable microservices handling high throughput recruitment workflows with Next.js and Prisma.",
        "Optimized frontend bundle size resulting in 35% faster page load times.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.Tech in Computer Science & Engineering",
      institution: "Technocrats Institute of Technology",
      location: "Bhopal, India",
      startDate: "2021",
      endDate: "2025",
      grade: "8.5 CGPA",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Enterprise Multi-Agent RAG Assistant",
      description: "AI-powered document intelligence and multi-modal semantic search system.",
      techStack: ["Next.js", "Python", "LangChain", "Qdrant", "FastAPI"],
      liveUrl: "https://rag-demo.skillassociate.dev",
      repoUrl: "https://github.com/ANUPAM456/rag-assistant",
      bullets: [
        "Architected real-time RAG pipeline querying multi-modal PDF documents with semantic chunking.",
        "Implemented vector search using Qdrant reducing hallucination rates by 40%.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2025",
      credentialUrl: "https://credly.com/badges/aws-solutions-architect",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Winner — Global AI Hackathon 2025",
      description: "Awarded 1st place among 500+ competing international developer teams.",
      proofUrl: "https://hackathon.dev/winners/2025",
    },
  ],
  settings: defaultResumeSettings,
};
