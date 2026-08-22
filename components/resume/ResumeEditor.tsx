"use client";

import React, { useState } from "react";
import { User, FileText, Code2, Briefcase, GraduationCap, FolderKanban, Award, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { ResumeData } from "@/lib/resume/types";
import { PersonalInfoEditor } from "./PersonalInfoEditor";
import { SummaryEditor } from "./SummaryEditor";
import { SkillsEditor } from "./SkillsEditor";
import { ExperienceEditor } from "./ExperienceEditor";
import { EducationEditor } from "./EducationEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { CertificationsEditor } from "./CertificationsEditor";
import { AchievementsEditor } from "./AchievementsEditor";
import { SectionManager } from "./SectionManager";

export interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeEditor({ data, onChange }: ResumeEditorProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    skills: true,
    projects: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { key: "personal", label: "Personal Information", icon: User, component: <PersonalInfoEditor info={data.personalInfo} onChange={(info) => onChange({ ...data, personalInfo: info })} /> },
    { key: "summary", label: "Professional Summary", icon: FileText, component: <SummaryEditor summary={data.summary} onChange={(summary) => onChange({ ...data, summary })} /> },
    { key: "skills", label: "Technical Skills", icon: Code2, component: <SkillsEditor skills={data.skills} onChange={(skills) => onChange({ ...data, skills })} /> },
    { key: "projects", label: "Featured Projects", icon: FolderKanban, component: <ProjectsEditor items={data.projects} onChange={(projects) => onChange({ ...data, projects })} /> },
    { key: "experience", label: "Work Experience", icon: Briefcase, component: <ExperienceEditor items={data.experience} onChange={(experience) => onChange({ ...data, experience })} /> },
    { key: "education", label: "Education", icon: GraduationCap, component: <EducationEditor items={data.education} onChange={(education) => onChange({ ...data, education })} /> },
    { key: "certifications", label: "Certifications", icon: Award, component: <CertificationsEditor items={data.certifications} onChange={(certifications) => onChange({ ...data, certifications })} /> },
    { key: "achievements", label: "Achievements", icon: Trophy, component: <AchievementsEditor items={data.achievements} onChange={(achievements) => onChange({ ...data, achievements })} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Section Ordering Manager */}
      <SectionManager settings={data.settings} onChange={(settings) => onChange({ ...data, settings })} />

      {/* Accordion Editor Sections */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isOpen = openSections[sec.key];

          return (
            <div key={sec.key} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-subtle">
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-neutral-50 transition-colors text-left font-bold text-xs text-neutral-950 select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="uppercase tracking-wider font-mono">{sec.label}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>

              {isOpen && <div className="px-5 pb-5 pt-1 border-t border-neutral-100 animate-in fade-in">{sec.component}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
