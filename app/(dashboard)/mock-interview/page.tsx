"use client";

import React, { useState, useEffect, useCallback } from "react";
import { InterviewSetupWizard } from "@/components/interview/InterviewSetupWizard";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { InterviewReportView } from "@/components/interview/InterviewReportView";
import { InterviewHistoryView, PastSessionItem } from "@/components/interview/InterviewHistoryView";
import { FinalInterviewReport, InterviewSetupConfig } from "@/lib/interview/types";

type ViewMode = "SETUP" | "ROOM" | "REPORT" | "HISTORY";

export default function MockInterviewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("SETUP");
  const [sessionId, setSessionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [initialQuestion, setInitialQuestion] = useState<{
    id: string;
    questionIndex: number;
    category: string;
    questionText: string;
  } | null>(null);

  const [finalReport, setFinalReport] = useState<FinalInterviewReport | null>(null);
  const [historySessions, setHistorySessions] = useState<PastSessionItem[]>([]);
  const [historyStats, setHistoryStats] = useState<{ totalInterviews: number; completedCount: number; averageScore: number }>({
    totalInterviews: 0,
    completedCount: 0,
    averageScore: 0,
  });

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/interview");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHistorySessions(json.sessions || []);
          setHistoryStats(json.stats || { totalInterviews: 0, completedCount: 0, averageScore: 0 });
        }
      }
    } catch {
      // Handle silently
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle interview creation & starting
  const handleStartInterview = async (config: InterviewSetupConfig) => {
    setIsSubmitting(true);
    try {
      // 1. Create Interview Session
      const createRes = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        throw new Error(createJson.error || "Failed to create interview session.");
      }

      const newSessionId = createJson.sessionId;
      setSessionId(newSessionId);

      // 2. Start Session & Fetch Opening Question
      const startRes = await fetch(`/api/interview/${newSessionId}/start`, {
        method: "POST",
      });

      const startJson = await startRes.json();
      if (!startRes.ok || !startJson.success) {
        throw new Error(startJson.error || "Failed to initialize opening question.");
      }

      setInitialQuestion(startJson.currentQuestion);
      setViewMode("ROOM");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start interview session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Candidate Answer Submission
  const handleAnswerSubmit = async (questionId: string, answerText: string, audioDuration?: number) => {
    const res = await fetch(`/api/interview/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId,
        candidateAnswerText: answerText,
        audioDurationSeconds: audioDuration,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to process answer.");
    }

    return {
      evaluatedQuestion: json.evaluatedQuestion,
      nextQuestion: json.nextQuestion,
      isInterviewComplete: json.isInterviewComplete,
    };
  };

  // Handle Interview Finalization & Report Fetch
  const handleEndInterview = async () => {
    try {
      const endRes = await fetch(`/api/interview/${sessionId}/end`, {
        method: "POST",
      });

      const endJson = await endRes.json();
      if (endRes.ok && endJson.success && endJson.report) {
        setFinalReport(endJson.report);
      } else {
        const reportRes = await fetch(`/api/interview/${sessionId}/report`);
        const reportJson = await reportRes.json();
        if (reportJson.success) {
          setFinalReport(reportJson.report);
        }
      }

      setViewMode("REPORT");
      loadHistory();
    } catch {
      setViewMode("SETUP");
    }
  };

  const handleSelectHistorySession = async (id: string) => {
    setSessionId(id);
    try {
      const res = await fetch(`/api/interview/${id}/report`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.report) {
          setFinalReport(json.report);
          setViewMode("REPORT");
          return;
        }
      }
    } catch {
      // Handle silently
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Top Segmented Navigation Bar */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-1.5 flex items-center gap-1.5 shadow-2xs font-mono text-xs font-bold max-w-5xl mx-auto">
        <button
          onClick={() => setViewMode("SETUP")}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            viewMode === "SETUP"
              ? "bg-neutral-950 text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
          }`}
        >
          <span>Interview Setup</span>
        </button>

        {viewMode === "ROOM" && (
          <button
            onClick={() => setViewMode("ROOM")}
            className="flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 bg-neutral-950 text-white shadow-xs"
          >
            <span>Live Interview Room</span>
          </button>
        )}

        {finalReport && (
          <button
            onClick={() => setViewMode("REPORT")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              viewMode === "REPORT"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
            }`}
          >
            <span>Final Report</span>
          </button>
        )}

        <button
          onClick={() => {
            loadHistory();
            setViewMode("HISTORY");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            viewMode === "HISTORY"
              ? "bg-neutral-950 text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
          }`}
        >
          <span>History & Analytics ({historySessions.length})</span>
        </button>
      </div>

      {/* Main View Router */}
      {viewMode === "SETUP" && (
        <InterviewSetupWizard
          onStartInterview={handleStartInterview}
          isSubmitting={isSubmitting}
        />
      )}

      {viewMode === "ROOM" && initialQuestion && (
        <InterviewRoom
          sessionId={sessionId}
          initialQuestion={initialQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          onEndInterview={handleEndInterview}
        />
      )}

      {viewMode === "REPORT" && finalReport && (
        <InterviewReportView
          report={finalReport}
          onRestartNewInterview={() => setViewMode("SETUP")}
        />
      )}

      {viewMode === "HISTORY" && (
        <InterviewHistoryView
          sessions={historySessions}
          stats={historyStats}
          onSelectSession={handleSelectHistorySession}
          onStartNew={() => setViewMode("SETUP")}
        />
      )}
    </div>
  );
}
