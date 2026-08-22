"use client";

import React, { useRef } from "react";
import { Plus, Trash2, Award, Link as LinkIcon, FileUp, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeCertificationItem } from "@/lib/resume/types";

export interface CertificationsEditorProps {
  items: ResumeCertificationItem[];
  onChange: (items: ResumeCertificationItem[]) => void;
}

export function CertificationsEditor({ items, onChange }: CertificationsEditorProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addItem = () => {
    const newItem: ResumeCertificationItem = {
      id: `cert-${Date.now()}`,
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2025",
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ResumeCertificationItem, value: string | undefined) => {
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
                credentialUrl: dataUrl,
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
              credentialUrl: item.credentialUrl?.startsWith("data:") ? "" : item.credentialUrl,
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
              <Award className="w-3.5 h-3.5 text-neutral-600" />
              <span>Certification {idx + 1}</span>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-1 text-neutral-400 hover:text-neutral-950 transition-colors"
              aria-label="Remove certification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Certification Name"
              placeholder="AWS Certified Solutions Architect"
              value={item.name}
              onChange={(e) => updateItem(item.id, "name", e.target.value)}
              className="bg-white text-xs h-9"
            />
            <Input
              label="Issuing Organization"
              placeholder="Amazon Web Services"
              value={item.issuer}
              onChange={(e) => updateItem(item.id, "issuer", e.target.value)}
              className="bg-white text-xs h-9"
            />
          </div>

          <Input
            label="Issue Date"
            placeholder="2025 / Sep 2024"
            value={item.issueDate}
            onChange={(e) => updateItem(item.id, "issueDate", e.target.value)}
            className="bg-white text-xs h-9"
          />

          {/* Credential URL Link & PDF Upload Options */}
          <div className="space-y-2 pt-1 border-t border-neutral-200/60">
            <Input
              label="Credential Link / Verification URL"
              placeholder="https://credly.com/badges/your-badge-id"
              value={item.credentialUrl?.startsWith("data:") ? "" : item.credentialUrl || ""}
              onChange={(e) => updateItem(item.id, "credentialUrl", e.target.value)}
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
                Upload Certificate PDF
              </Button>

              {item.pdfFileName && (
                <div className="bg-neutral-900 text-white text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-2">
                  <span>PDF: {item.pdfFileName}</span>
                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
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

              {item.credentialUrl && !item.pdfFileName && (
                <a
                  href={item.credentialUrl}
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
        Add Certification
      </Button>
    </div>
  );
}
