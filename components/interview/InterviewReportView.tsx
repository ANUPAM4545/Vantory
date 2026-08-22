"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { FinalInterviewReport } from "@/lib/interview/types";

export interface InterviewReportViewProps {
  report: FinalInterviewReport;
  onRestartNewInterview?: () => void;
}

export function InterviewReportView({ report, onRestartNewInterview }: InterviewReportViewProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "Excellent":
      case "Strong":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "Developing":
        return "bg-amber-100 text-amber-900 border-amber-300";
      default:
        return "bg-red-100 text-red-900 border-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-950 font-sans p-4 sm:p-6 md:p-8 space-y-6 w-full max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
              AI MOCK INTERVIEW REPORT
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 flex items-center gap-2.5 mt-0.5">
              <span>{report.targetJobTitle}</span>
              {report.companyName && (
                <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-xl">
                  {report.companyName}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-2xl text-xs font-mono font-extrabold border ${getReadinessColor(report.readinessLevel)}`}>
              Readiness: {report.readinessLevel}
            </span>
          </div>
        </div>

        {/* 3 Overview Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-neutral-950 text-white rounded-3xl p-6 space-y-2 relative overflow-hidden shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">
                OVERVIEW READINESS SCORE
              </span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-4xl font-black text-white font-mono tracking-tighter">
              {report.readinessScore}
              <span className="text-xs font-normal text-neutral-400">/100</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-medium">
              Evaluated against role requirements & seniority expectations.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold">
                TECHNICAL SCORE
              </span>
              <Zap className="w-4.5 h-4.5 text-neutral-950" />
            </div>
            <div className="text-4xl font-black text-neutral-950 font-mono tracking-tighter">
              {report.categoryBreakdown.technicalScore}
              <span className="text-xs font-normal text-neutral-400">/100</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Technical accuracy, architecture & execution depth.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold">
                ROLE ALIGNMENT
              </span>
              <Target className="w-4.5 h-4.5 text-neutral-950" />
            </div>
            <div className="text-4xl font-black text-neutral-950 font-mono tracking-tighter">
              {report.categoryBreakdown.roleAlignmentScore}
              <span className="text-xs font-normal text-neutral-400">/100</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Relevance to job description responsibilities.
            </p>
          </div>
        </div>
      </div>

      {/* Category & Skill Readiness Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-200 pb-3">
            CATEGORY SCORE BREAKDOWN
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(report.categoryBreakdown).map(([key, val]) => (
              <div key={key} className="space-y-1.5 p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-neutral-700 capitalize font-bold">
                    {key.replace(/Score/g, "").replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="font-extrabold text-neutral-950">{val}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-950 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Readiness Breakdown */}
        <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-200 pb-3">
            ROLE REQUIREMENT READINESS
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(report.roleReadinessBreakdown).map(([skill, score]) => (
              <div key={skill} className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-neutral-950">{skill}</span>
                <span className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold ${
                  score >= 85 ? "bg-emerald-100 text-emerald-900 border border-emerald-200" : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}>
                  {score}% Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths vs Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 space-y-3">
          <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>STRONGEST AREAS</span>
          </h3>
          <ul className="space-y-2 text-xs text-neutral-700 font-medium">
            {report.strongestAreas.map((item, idx) => (
              <li key={idx} className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 space-y-3">
          <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AREAS TO IMPROVE</span>
          </h3>
          <ul className="space-y-2 text-xs text-neutral-700 font-medium">
            {report.areasToImprove.map((item, idx) => (
              <li key={idx} className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 sm:p-7 space-y-5">
        <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-200 pb-3.5 flex items-center justify-between">
          <span>QUESTION-BY-QUESTION REVIEW ({report.questionReviews.length})</span>
          <BookOpen className="w-4 h-4 text-neutral-950" />
        </h3>

        <div className="space-y-4">
          {report.questionReviews.map((item) => {
            const isExpanded = expandedQuestion === item.questionIndex;

            return (
              <div
                key={item.questionIndex}
                className="p-4 sm:p-5 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl space-y-3 transition-all"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : item.questionIndex)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-neutral-950">
                        Q{item.questionIndex}: {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-950 text-white">
                        Score: {item.score}/100
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-900 font-serif">
                      &ldquo;{item.questionText}&rdquo;
                    </p>
                  </div>

                  <button className="p-1 text-neutral-400 hover:text-neutral-950 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-950" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 text-xs pt-3 border-t border-neutral-200 animate-in fade-in">
                    {/* Candidate Answer */}
                    <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Your Response:</span>
                      <p className="italic text-neutral-800 font-serif leading-relaxed">
                        &ldquo;{item.candidateAnswerText}&rdquo;
                      </p>
                    </div>

                    {/* Evaluation Feedback */}
                    <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Feedback & Suggestions:</span>
                      <p className="text-neutral-700 font-medium">{item.evaluation.feedback}</p>
                      {item.evaluation.improvementSuggestions.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-mono text-amber-700 font-bold block">Key Improvement Suggestions:</span>
                          <ul className="list-disc list-inside text-neutral-600 font-medium space-y-0.5">
                            {item.evaluation.improvementSuggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Ideal Answer Guidance */}
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-amber-900 uppercase block font-bold">Ideal Answer Structure Guidance:</span>
                      <p className="text-amber-900 font-mono text-[11px] leading-relaxed">
                        {item.evaluation.exampleAnswerStructure}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized 7-Day Preparation Plan */}
      <div className="bg-white border border-neutral-200/80 shadow-sm rounded-3xl p-6 sm:p-7 space-y-5">
        <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-200 pb-3.5 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-neutral-950" />
            <span>YOUR TAILORED 7-DAY INTERVIEW PREPARATION PLAN</span>
          </span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {report.preparationPlan.map((day) => (
            <div key={day.day} className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl space-y-2 text-xs hover:border-neutral-300 transition-all">
              <div className="flex items-center justify-between font-mono">
                <span className="px-2 py-0.5 rounded bg-neutral-950 text-white font-bold text-[10px]">
                  DAY {day.day}
                </span>
              </div>
              <h4 className="font-extrabold text-neutral-950 text-xs">{day.topic}</h4>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">{day.whyItMatters}</p>
              <div className="pt-1.5 border-t border-neutral-200 text-[10px] font-mono text-neutral-700 space-y-1">
                <div className="font-bold text-neutral-950">Target Outcome:</div>
                <div className="italic text-neutral-600">{day.targetOutcome}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onRestartNewInterview}
          className="px-6 py-3.5 bg-neutral-950 text-white font-extrabold text-xs rounded-2xl hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New Interview Session</span>
        </button>

        <Link
          href="/ats-checker"
          className="px-5 py-3.5 bg-white text-neutral-950 font-bold text-xs border border-neutral-300 rounded-2xl hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-2xs"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Check ATS Resume Compatibility</span>
        </Link>
      </div>
    </div>
  );
}
