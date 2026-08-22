"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Users, ArrowUpRight, Search } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string;
  workMode: string;
  type: string;
  experience: string;
  salary: string | null;
  postedAt: string;
  instituteApplicantsCount: number;
}

export default function InstituteJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/institute/jobs");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.jobs) {
            setJobs(json.jobs);
          }
        }
      } catch {
        // Handle silently
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

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
                Campus Hiring Jobs Marketplace
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Active Corporate Partner Openings & Institute Student Applicant Metrics
              </p>
            </div>
          </div>

          {/* Search bar */}
          <Card className="border border-neutral-200/90 rounded-2xl bg-white p-4 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search active jobs by role, company name, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs h-10 rounded-xl"
              />
            </div>
          </Card>

          {/* Jobs Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-400">Loading active hiring openings...</div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="border border-neutral-200/90 rounded-3xl bg-white p-6 shadow-xs hover:border-neutral-400 hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500 font-medium">{job.company}</div>
                          <h3 className="text-base font-extrabold text-neutral-950 tracking-tight leading-snug">
                            {job.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-neutral-600">
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" /> {job.location} ({job.workMode})
                      </span>
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-lg">{job.type}</span>
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-lg">{job.experience}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-950">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>{job.instituteApplicantsCount} Institute Applicants</span>
                    </div>

                    <Link href={`/jobs/${job.id}`}>
                      <span className="text-xs font-extrabold text-neutral-950 hover:underline inline-flex items-center gap-0.5">
                        View Job <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-mono text-neutral-400">No matching campus openings found.</div>
          )}
        </main>
      </div>
    </div>
  );
}
