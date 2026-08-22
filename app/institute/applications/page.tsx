"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApplicationItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  jobTitle: string;
  companyName: string;
  location: string;
  status: string;
  appliedAt: string;
}

export default function InstituteApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function fetchApps() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (statusFilter !== "ALL") query.set("status", statusFilter);
        if (search.trim()) query.set("search", search.trim());

        const res = await fetch(`/api/institute/applications?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.applications) {
            setApplications(json.applications);
          }
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, [search, statusFilter]);

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
                Institutional Application Tracker
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Real-Time Campus Pipeline ({applications.length} Active Student Applications Recorded)
              </p>
            </div>
          </div>

          {/* Search & Filter bar */}
          <Card className="border border-neutral-200/90 rounded-2xl bg-white p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search candidate name, company, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-xs h-10 rounded-xl"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-900 focus:border-neutral-950 focus:outline-none"
                >
                  <option value="ALL">All Application Pipeline Statuses</option>
                  <option value="APPLIED">Applied</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview Scheduled</option>
                  <option value="OFFERED">Offered / Placed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Applications Data Table */}
          <Card className="border border-neutral-200/90 rounded-3xl bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200/80 text-[10px] font-mono font-bold tracking-wider text-neutral-500 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">STUDENT CANDIDATE</th>
                    <th className="py-3.5 px-4">DEPARTMENT</th>
                    <th className="py-3.5 px-4">TARGET JOB ROLE</th>
                    <th className="py-3.5 px-4">COMPANY / EMPLOYER</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs font-mono text-neutral-400">
                        Loading student application pipeline...
                      </td>
                    </tr>
                  ) : applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-neutral-950 text-sm">{app.studentName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{app.studentEmail}</div>
                        </td>

                        <td className="py-4 px-4 font-medium text-neutral-800">{app.department}</td>

                        <td className="py-4 px-4 font-bold text-neutral-950">{app.jobTitle}</td>

                        <td className="py-4 px-4 font-semibold text-neutral-800">{app.companyName}</td>

                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              app.status === "OFFERED"
                                ? "success"
                                : app.status === "SHORTLISTED" || app.status === "INTERVIEW"
                                ? "dark"
                                : "subtle"
                            }
                            className="font-mono text-[10px]"
                          >
                            {app.status}
                          </Badge>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Link href={`/institute/students/${app.studentId}`}>
                            <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-lg">
                              Student Profile <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs font-mono text-neutral-400">
                        No student applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
