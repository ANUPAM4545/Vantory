"use client";

import React, { useState } from "react";
import { Download, RotateCcw, Check, Sparkles, Layout, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DropdownMenu } from "@/components/ui/dropdown";
import { ResumeSettings } from "@/lib/resume/types";

export interface ResumeToolbarProps {
  settings: ResumeSettings;
  onSettingsChange: (settings: ResumeSettings) => void;
  saveStatus: "saving" | "saved" | "unsaved";
  onReset: () => void;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
}

export function ResumeToolbar({
  settings,
  onSettingsChange,
  saveStatus,
  onReset,
  onDownloadPdf,
  isDownloadingPdf = false,
}: ResumeToolbarProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [targetJobTitle, setTargetJobTitle] = useState("Software Engineer");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [atsResult, setAtsResult] = useState<{ overallScore: number; confidenceLevel: string } | null>(null);
  const [atsError, setAtsError] = useState<string | null>(null);

  const templateOptions = [
    { id: "classic-monochrome", label: "Classic Monochrome (LaTeX Standard)", shortLabel: "Classic Monochrome" },
    { id: "latex-classic", label: "Overleaf Classic (Single Column)", shortLabel: "Overleaf Classic" },
    { id: "latex-minimal", label: "LaTeX Minimal (Compact)", shortLabel: "LaTeX Minimal" },
  ];

  const activeTemplate = templateOptions.find((t) => t.id === settings.templateId) || templateOptions[0];

  const handleRunAtsCheck = async () => {
    if (!jobDescription.trim()) {
      setAtsError("Please paste a target Job Description to analyze match.");
      return;
    }

    setIsAnalyzingAts(true);
    setAtsError(null);
    setAtsResult(null);

    try {
      const res = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetJobTitle,
          companyName,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze ATS match.");
      }

      setAtsResult({
        overallScore: data.report.overallScore,
        confidenceLevel: data.report.confidenceLevel,
      });
    } catch (err: unknown) {
      setAtsError(err instanceof Error ? err.message : "ATS analysis failed.");
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="dark">
            <Sparkles className="w-3 h-3 text-white" />
            SKILLASSOCIATE BUILDER
          </Badge>
          <span className="text-xs font-mono text-neutral-400">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "✓ Saved"}
            {saveStatus === "unsaved" && "Unsaved changes"}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950">
          Smart Resume Builder
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Auto-populated with your profile. LaTeX-based ATS architecture with live A4 preview.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
        {/* Template Selector Dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <Button variant="outline" size="sm" leftIcon={<Layout className="w-4 h-4" />}>
              Template: {activeTemplate.shortLabel}
            </Button>
          }
          items={templateOptions.map((t) => ({
            label: t.label,
            icon: settings.templateId === t.id ? <Check className="w-4 h-4 text-neutral-950 stroke-[3]" /> : undefined,
            onClick: () =>
              onSettingsChange({
                ...settings,
                templateId: t.id as ResumeSettings["templateId"],
              }),
          }))}
        />

        {/* Reset Confirmation Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsResetModalOpen(true)}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset
        </Button>

        {/* Analyze ATS Score Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAtsModalOpen(true)}
          leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
        >
          Check ATS Match
        </Button>

        {/* Download PDF Button */}
        <Button
          variant="primary"
          size="sm"
          isLoading={isDownloadingPdf}
          onClick={onDownloadPdf}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Download PDF
        </Button>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Resume Data?"
        description="This will restore your resume to default profile information. Custom edits will be overwritten."
      >
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onReset();
              setIsResetModalOpen(false);
            }}
          >
            Confirm Reset
          </Button>
        </div>
      </Modal>

      {/* ATS Match Modal */}
      <Modal
        isOpen={isAtsModalOpen}
        onClose={() => {
          setIsAtsModalOpen(false);
          setAtsResult(null);
          setAtsError(null);
        }}
        title="SkillAssociate Job Match Score"
        description="Paste a Target Job Description to analyze your ATS Compatibility Score directly against your resume."
      >
        <div className="space-y-4 pt-2">
          {atsError && (
            <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-neutral-950" />
              <span>{atsError}</span>
            </div>
          )}

          {atsResult ? (
            <div className="bg-neutral-950 text-white rounded-2xl p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-white font-mono text-3xl font-black">
                {atsResult.overallScore}%
              </div>
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  ATS Match Score: {atsResult.overallScore}/100
                </h4>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Confidence Level: {atsResult.confidenceLevel}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-black hover:bg-neutral-200 border-none font-bold"
                  onClick={() => window.location.href = "/ats-checker"}
                >
                  View Detailed Breakdown →
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400 hover:text-white"
                  onClick={() => setAtsResult(null)}
                >
                  Test Another Role
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 mb-1 font-bold">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-950"
                    placeholder="e.g. Full Stack Engineer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-600 mb-1 font-bold">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-950"
                    placeholder="e.g. Nextute"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-600 mb-1 font-bold">
                  Target Job Description
                </label>
                <textarea
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-3 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="Paste complete job description requirements here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAtsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isAnalyzingAts}
                  onClick={handleRunAtsCheck}
                  leftIcon={isAnalyzingAts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isAnalyzingAts ? "Analyzing ATS Match..." : "Calculate ATS Score"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
