"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { ResumeData } from "@/lib/resume/types";
import { ResumeToolbar } from "./ResumeToolbar";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { TextAiSelectionMenu } from "../ai/TextAiSelectionMenu";

export interface ResumeWorkspaceProps {
  initialResume: ResumeData;
}

export function ResumeWorkspace({ initialResume }: ResumeWorkspaceProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResume);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "unsaved">("saved");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const isFirstRender = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Page Count Detection
  useEffect(() => {
    const checkPages = () => {
      const el = document.getElementById("resume-a4-preview");
      if (el) {
        const pages = Math.max(1, Math.ceil(el.scrollHeight / 1050));
        setTotalPages(pages);
      }
    };

    checkPages();
    const timer = setTimeout(checkPages, 300);
    return () => clearTimeout(timer);
  }, [resumeData, zoomLevel]);

  // Handle scroll position detection for page counter
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const pageHeight = 1050 * zoomLevel;
    const page = Math.min(totalPages, Math.max(1, Math.floor(scrollTop / pageHeight) + 1));
    setCurrentPage(page);
  };

  const handleScrollPage = (direction: "prev" | "next") => {
    if (!scrollContainerRef.current) return;
    const targetPage = direction === "next" ? Math.min(totalPages, currentPage + 1) : Math.max(1, currentPage - 1);
    setCurrentPage(targetPage);
    scrollContainerRef.current.scrollTo({
      top: (targetPage - 1) * 1050 * zoomLevel,
      behavior: "smooth",
    });
  };

  // Cycle zoom level when percentage is clicked
  const handleCycleZoom = () => {
    const presets = [0.65, 0.85, 1.0, 1.15];
    const currentIndex = presets.indexOf(zoomLevel);
    const nextIndex = (currentIndex + 1) % presets.length;
    setZoomLevel(presets[nextIndex]);
  };

  // Debounced auto-save effect
  const saveResume = useCallback(async (dataToSave: ResumeData) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const json = await res.json();
      if (json.success && json.resume) {
        if (!dataToSave.id && json.resume.id) {
          setResumeData((prev) => ({ ...prev, id: json.resume.id }));
        }
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
      }
    } catch {
      setSaveStatus("unsaved");
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus("unsaved");
    const timer = setTimeout(() => {
      saveResume(resumeData);
    }, 600);

    return () => clearTimeout(timer);
  }, [resumeData, saveResume]);

  const handleReset = () => {
    setResumeData(initialResume);
  };

  const handleRecompile = () => {
    setIsRecompiling(true);
    setTimeout(() => {
      setIsRecompiling(false);
    }, 350);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await fetch("/api/resumes/active/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });

      if (!res.ok) {
        throw new Error("Failed to compile PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resumeData.personalInfo?.fullName || "Resume").replace(/\s+/g, "_")}_SkillAssociate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Unable to generate your PDF right now. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-neutral-900 selection:text-white pb-12">
      {/* Top Toolbar */}
      <ResumeToolbar
        settings={resumeData.settings}
        onSettingsChange={(settings) => setResumeData({ ...resumeData, settings })}
        saveStatus={saveStatus}
        onReset={handleReset}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-600 font-bold">
              RESUME CONTENT EDITOR
            </h2>
            <span className="text-xs text-neutral-400 font-mono">Structured JSON Source</span>
          </div>

          <ResumeEditor data={resumeData} onChange={setResumeData} />
        </div>

        {/* Right Column: Live A4 Overleaf Preview */}
        <div className="lg:col-span-6 space-y-3 lg:sticky lg:top-20">
          {/* Overleaf Control Bar (Sleek Dark Theme Aligned) */}
          <div className="bg-neutral-950 text-white p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl font-sans text-xs border border-neutral-800">
            {/* Recompile Button */}
            <button
              onClick={handleRecompile}
              disabled={isRecompiling}
              className="bg-white text-neutral-950 hover:bg-neutral-200 active:bg-neutral-300 px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-950 ${isRecompiling ? "animate-spin" : ""}`} />
              <span>{isRecompiling ? "Compiling..." : "Recompile"}</span>
            </button>

            {/* Page Navigation Indicator < 1 / 1 > */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-200">
              <button
                onClick={() => handleScrollPage("prev")}
                disabled={currentPage <= 1}
                className="text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold">{currentPage} / {totalPages}</span>
              <button
                onClick={() => handleScrollPage("next")}
                disabled={currentPage >= totalPages}
                className="text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PDF Download & Zoom Control Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-75 border border-neutral-700"
                title="Download PDF"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? "animate-bounce" : ""}`} />
                <span className="hidden sm:inline">{isDownloadingPdf ? "PDF..." : "PDF"}</span>
              </button>

              <div className="flex items-center gap-1 text-[11px] font-mono bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.05).toFixed(2))))}
                  className="px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 font-bold transition-colors cursor-pointer"
                  title="Zoom Out (-5%)"
                >
                  -
                </button>

                <span
                  onClick={handleCycleZoom}
                  className="px-1.5 min-w-[42px] text-center font-bold text-neutral-100 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Click to cycle zoom presets"
                >
                  {Math.round(zoomLevel * 100)}%
                </span>

                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.3, Number((z + 0.05).toFixed(2))))}
                  className="px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 font-bold transition-colors cursor-pointer"
                  title="Zoom In (+5%)"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Paper View Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-4 sm:p-6 flex justify-center items-start overflow-x-auto overflow-y-auto h-[calc(100vh-170px)] shadow-2xl custom-scrollbar"
          >
            <div
              style={{
                zoom: zoomLevel,
                transition: "zoom 0.2s ease-in-out",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ResumePreview data={resumeData} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Text Selection Refiner Menu */}
      <TextAiSelectionMenu resumeData={resumeData} onUpdateResume={setResumeData} />
    </div>
  );
}
