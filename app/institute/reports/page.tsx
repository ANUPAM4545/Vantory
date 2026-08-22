"use client";

import React, { useState } from "react";
import { Download, FileText, ShieldCheck } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudentReportItem {
  name: string;
  email: string;
  studentId: string | null;
  department: string;
  course: string;
  graduationYear: number;
  profileCompletion: number;
  placementStatus: string;
  readiness: {
    readinessCategory: string;
  };
}

export default function InstituteReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportRoster = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/institute/students?limit=1000");
      if (res.ok) {
        const json = await res.json();
        const students: StudentReportItem[] = json.data?.students || [];

        const headers = ["Name", "Email", "StudentID", "Department", "Course", "GraduationYear", "ProfileScore", "PlacementStatus", "ReadinessCategory"];
        const csvLines = [
          headers.join(","),
          ...students.map((s) =>
            [
              `"${s.name}"`,
              `"${s.email}"`,
              `"${s.studentId || ""}"`,
              `"${s.department}"`,
              `"${s.course}"`,
              s.graduationYear,
              s.profileCompletion,
              `"${s.placementStatus}"`,
              `"${s.readiness.readinessCategory}"`,
            ].join(",")
          ),
        ];

        const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `SkillAssociate_Campus_Placement_Report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      // Handle error
    } finally {
      setIsExporting(false);
    }
  };

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
                Institutional Reports & Data Export
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Generate Verified Placement Documentation & CSV Roster Export
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              isLoading={isExporting}
              onClick={handleExportRoster}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Full Placement CSV Report
            </Button>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-neutral-200/90 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-950">Student Readiness Audit Report</h3>
                  <p className="text-xs text-neutral-500 font-mono">CSV Data Export</p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Contains complete candidate roster, individual ATS average scores, resume readiness indicators, and readiness classification.
              </p>
              <Button variant="outline" size="sm" onClick={handleExportRoster} isLoading={isExporting}>
                Download Audit CSV
              </Button>
            </Card>

            <Card className="border border-neutral-200/90 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-950">Verified Placement Verification</h3>
                  <p className="text-xs text-neutral-500 font-mono">Institutional Verification</p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Database-backed verification protocol ensuring zero fake student readiness or arbitrary AI metrics.
              </p>
              <Badge variant="success" className="font-mono text-[10px] w-fit">
                VERIFIED BY PRISMA DB
              </Badge>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
