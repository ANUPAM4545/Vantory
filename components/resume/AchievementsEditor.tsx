"use client";

import React, { useRef } from "react";
import { Plus, Trash2, Trophy, Link as LinkIcon, FileUp, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeAchievementItem } from "@/lib/resume/types";

export interface AchievementsEditorProps {
  items: ResumeAchievementItem[];
  onChange: (items: ResumeAchievementItem[]) => void;
}

export function AchievementsEditor({ items, onChange }: AchievementsEditorProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addItem = () => {
    const newItem: ResumeAchievementItem = {
      id: `ach-${Date.now()}`,
      title: "Winner — Global AI Hackathon 2025",
      description: "Awarded 1st place among 500+ competing international developer teams.",
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ResumeAchievementItem, value: string | undefined) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a valid PDF document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                proofUrl: dataUrl,
                pdfFileName: file.name,
              }
            : item
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              pdfFileName: undefined,
              proofUrl: item.proofUrl?.startsWith("data:") ? "" : item.proofUrl,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
              <Trophy className="w-3.5 h-3.5 text-neutral-600" />
              <span>Achievement {idx + 1}</span>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-1 text-neutral-400 hover:text-neutral-950 transition-colors"
              aria-label="Remove achievement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Input
            label="Achievement Title"
            placeholder="Winner — Global AI Hackathon 2025"
            value={item.title}
            onChange={(e) => updateItem(item.id, "title", e.target.value)}
            className="bg-white text-xs h-9"
          />

          <Input
            label="Short Description / Detail"
            placeholder="Awarded 1st place among 500+ competing international developer teams."
            value={item.description || ""}
            onChange={(e) => updateItem(item.id, "description", e.target.value)}
            className="bg-white text-xs h-9"
          />

          {/* Proof URL Link & PDF Upload Options */}
          <div className="space-y-2 pt-1 border-t border-neutral-200/60">
            <Input
              label="Proof / Certificate Link URL"
              placeholder="https://hackathon.dev/winners/2025"
              value={item.proofUrl?.startsWith("data:") ? "" : item.proofUrl || ""}
              onChange={(e) => updateItem(item.id, "proofUrl", e.target.value)}
              className="bg-white text-xs h-9"
              leftIcon={<LinkIcon className="w-3.5 h-3.5 text-neutral-500" />}
            />

            {/* Hidden File Input */}
            <input
              type="file"
              accept=".pdf,application/pdf"
              ref={(el) => { fileInputRefs.current[item.id] = el; }}
              onChange={(e) => handleFileUpload(item.id, e)}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[item.id]?.click()}
                className="bg-white text-xs h-8"
                leftIcon={<FileUp className="w-3.5 h-3.5 text-neutral-700" />}
              >
                Upload Proof PDF
              </Button>

              {item.pdfFileName && (
                <div className="bg-neutral-900 text-white text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-2">
                  <span>PDF: {item.pdfFileName}</span>
                  {item.proofUrl && (
                    <a
                      href={item.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-300 hover:text-white inline-flex items-center gap-0.5 underline"
                      title="View PDF"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {item.proofUrl && !item.pdfFileName && (
                <a
                  href={item.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-neutral-100 text-neutral-900 border border-neutral-300 text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-neutral-200 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-neutral-700" />
                  <span>Verify Link</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full text-xs"
        leftIcon={<Plus className="w-3.5 h-3.5" />}
      >
        Add Achievement
      </Button>
    </div>
  );
}
