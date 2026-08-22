"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Zap } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  funnel: {
    totalStudents: number;
    profileCompleteCount: number;
    resumeReadyCount: number;
    atsReadyCount: number;
    interviewReadyCount: number;
    placementReadyCount: number;
    placedCount: number;
  };
  departmentAnalytics: Array<{
    department: string;
    totalStudents: number;
    placementReadyCount: number;
    placedCount: number;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
}

export default function InstituteAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/institute/analytics");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.analytics) {
            setAnalytics(json.analytics);
          }
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-neutral-950 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                Campus Placement Analytics
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Department Breakdowns, Readiness Performance & Student Skill Distribution
              </p>
            </div>
          </div>

          {/* Department Readiness Breakdown Table */}
          <Card className="border border-neutral-200/90 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-neutral-950" />
                <h3 className="text-lg font-black text-neutral-950">Department-Level Readiness Breakdown</h3>
              </div>
              <Badge variant="dark" className="font-mono text-[10px]">VERIFIED STATS</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200/80 text-[10px] font-mono font-bold tracking-wider text-neutral-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">DEPARTMENT</th>
                    <th className="py-3 px-4">TOTAL STUDENTS</th>
                    <th className="py-3 px-4">PLACEMENT READY</th>
                    <th className="py-3 px-4">READINESS RATE</th>
                    <th className="py-3 px-4">OFFERS / PLACED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">Loading department data...</td>
                    </tr>
                  ) : analytics?.departmentAnalytics && analytics.departmentAnalytics.length > 0 ? (
                    analytics.departmentAnalytics.map((dept) => {
                      const rate = dept.totalStudents > 0 ? Math.round((dept.placementReadyCount / dept.totalStudents) * 100) : 0;
                      return (
                        <tr key={dept.department} className="hover:bg-neutral-50/80">
                          <td className="py-3.5 px-4 font-sans font-extrabold text-neutral-950">{dept.department}</td>
                          <td className="py-3.5 px-4 font-bold text-neutral-900">{dept.totalStudents}</td>
                          <td className="py-3.5 px-4 text-emerald-700 font-black">{dept.placementReadyCount}</td>
                          <td className="py-3.5 px-4 font-bold text-neutral-950">{rate}%</td>
                          <td className="py-3.5 px-4 text-purple-700 font-black">{dept.placedCount}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">No department breakdown available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Student Skills Matrix */}
          <Card className="border border-neutral-200/90 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4">
              <Zap className="w-5 h-5 text-neutral-950" />
              <h3 className="text-lg font-black text-neutral-950">Top Student Skill Distribution</h3>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs font-mono text-neutral-400">Loading skill matrix...</div>
            ) : analytics?.topSkills && analytics.topSkills.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {analytics.topSkills.map((item) => (
                  <div key={item.skill} className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-center space-y-1">
                    <div className="text-sm font-extrabold text-neutral-950">{item.skill}</div>
                    <div className="text-xs font-mono text-neutral-500">{item.count} Candidates</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-neutral-400">No student skills recorded yet.</div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
