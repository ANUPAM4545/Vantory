"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, RefreshCw } from "lucide-react";

interface CompanyStatsData {
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  shortlistedCount: number;
  offersCount: number;
}

interface CandidateApplicationItem {
  id: string;
  status: string;
}

export default function CompanyAnalyticsPage() {
  const [stats, setStats] = useState<CompanyStatsData>({
    activeJobs: 0,
    totalJobs: 0,
    totalApplications: 0,
    shortlistedCount: 0,
    offersCount: 0,
  });
  const [applications, setApplications] = useState<CandidateApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        fetch("/api/company/stats"),
        fetch("/api/company/applications"),
      ]);

      if (statsRes.ok) {
        const sJson = await statsRes.json();
        if (sJson.success && sJson.stats) setStats(sJson.stats);
      }

      if (appsRes.ok) {
        const aJson = await appsRes.json();
        if (aJson.success && Array.isArray(aJson.applications)) setApplications(aJson.applications);
      }
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const underReviewCount = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;

  const totalApps = stats.totalApplications || 1;
  const shortlistRate = Math.round((stats.shortlistedCount / totalApps) * 100);
  const offerRate = Math.round((stats.offersCount / totalApps) * 100);

  return (
    <div className="space-y-6 selection:bg-neutral-950 selection:text-white font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tight">Deterministic Hiring Funnel Analytics</h1>
          <p className="text-xs text-neutral-500 font-mono">Real-time candidate conversion pipeline derived directly from Prisma database records</p>
        </div>

        <button
          onClick={loadAnalyticsData}
          className="px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Main Analytics Container */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-8">
        {/* 5-Stage Funnel Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block font-semibold">1. Applications</span>
            <div className="text-2xl font-black text-neutral-950">{isLoading ? "-" : stats.totalApplications}</div>
            <span className="text-[10px] text-neutral-400 block">Total received</span>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block font-semibold">2. Under Review</span>
            <div className="text-2xl font-black text-neutral-950">{isLoading ? "-" : underReviewCount}</div>
            <span className="text-[10px] text-neutral-400 block">Evaluation pool</span>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block font-semibold">3. Shortlisted</span>
            <div className="text-2xl font-black text-neutral-950">{isLoading ? "-" : stats.shortlistedCount}</div>
            <span className="text-[10px] text-neutral-400 block">{shortlistRate}% conversion</span>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block font-semibold">4. Interview Stage</span>
            <div className="text-2xl font-black text-neutral-950">{isLoading ? "-" : interviewCount}</div>
            <span className="text-[10px] text-neutral-400 block">Tech interviews</span>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block font-semibold">5. Offers Extended</span>
            <div className="text-2xl font-black text-neutral-950">{isLoading ? "-" : stats.offersCount}</div>
            <span className="text-[10px] text-neutral-400 block">{offerRate}% offer rate</span>
          </div>
        </div>

        {/* Visual Conversion Progress Bars */}
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-950" />
            <span>Conversion Pipeline Breakdown</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-600">
                <span>Applications to Shortlisted</span>
                <span className="font-bold text-neutral-950">{shortlistRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-950 transition-all duration-500" style={{ width: `${Math.min(100, shortlistRate)}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-neutral-600">
                <span>Applications to Offers</span>
                <span className="font-bold text-neutral-950">{offerRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-950 transition-all duration-500" style={{ width: `${Math.min(100, offerRate)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
