"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ArrowUp, ArrowDown, GripVertical, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { ResumeSectionId, ResumeSettings } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

export interface SectionManagerProps {
  settings: ResumeSettings;
  onChange: (settings: ResumeSettings) => void;
}

const sectionLabels: Record<ResumeSectionId, string> = {
  personal: "Personal Information",
  summary: "Professional Summary",
  skills: "Technical Skills",
  experience: "Work Experience",
  projects: "Featured Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
};

export function SectionManager({ settings, onChange }: SectionManagerProps) {
  const { sectionOrder, sectionVisibility } = settings;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const toggleVisibility = (id: ResumeSectionId) => {
    // Personal information cannot be hidden
    if (id === "personal") return;

    onChange({
      ...settings,
      sectionVisibility: {
        ...sectionVisibility,
        [id]: !sectionVisibility[id],
      },
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const updated = [...sectionOrder];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onChange({
      ...settings,
      sectionOrder: updated,
    });
  };

  const activeCount = sectionOrder.filter((id) => sectionVisibility[id] !== false).length;

  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-subtle space-y-3 transition-all">
      {/* Dropdown Shrink/Expand Header */}
      <div
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-950" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-950 font-bold group-hover:underline">
            SECTION ORDERING & VISIBILITY
          </h3>
          <span className="text-[10px] font-mono text-neutral-600 font-bold bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
            {activeCount} Active
          </span>
        </div>

        <button
          type="button"
          className="p-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-neutral-950" />
          ) : (
            <ChevronUp className="w-4 h-4 text-neutral-950" />
          )}
        </button>
      </div>

      {/* Collapsible Section List */}
      {!isCollapsed && (
        <div className="space-y-1.5 pt-1 animate-in fade-in">
          {sectionOrder.map((sectionId, index) => {
            const isVisible = sectionVisibility[sectionId] !== false;
            const isPersonal = sectionId === "personal";

            return (
              <div
                key={sectionId}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-colors select-none",
                  isVisible
                    ? "bg-white border-neutral-200 text-neutral-950"
                    : "bg-neutral-50 border-neutral-200/60 text-neutral-400 opacity-60"
                )}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{sectionLabels[sectionId]}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, "up")}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-950 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label={`Move ${sectionLabels[sectionId]} up`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === sectionOrder.length - 1}
                    onClick={() => moveSection(index, "down")}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-950 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label={`Move ${sectionLabels[sectionId]} down`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  {!isPersonal && (
                    <button
                      type="button"
                      onClick={() => toggleVisibility(sectionId)}
                      className={cn(
                        "p-1 rounded transition-colors ml-1 cursor-pointer",
                        isVisible
                          ? "text-neutral-900 hover:bg-neutral-100"
                          : "text-neutral-400 hover:bg-neutral-200"
                      )}
                      aria-label={isVisible ? "Hide section" : "Show section"}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
