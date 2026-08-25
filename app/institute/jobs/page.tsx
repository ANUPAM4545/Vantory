"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Search,
  Briefcase,
  X,
  FileText,
  UserCheck,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobSummary {
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

interface JobApplicant {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  course: string;
  graduationYear: number;
  status: string;
  appliedAt: string;
}

interface JobDetailData {
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    description: string;
    requirements: string | null;
    location: string;
    workMode: string;
    type: string;
    experience: string;
    salary: string | null;
    postedAt: string;
  };
  applicants: JobApplicant[];
}

export default function InstituteJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State for Job Details & Campus Applicants Roster
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetailData, setJobDetailData] = useState<JobDetailData | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"APPLICANTS" | "DETAILS">("APPLICANTS");

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

  const openJobModal = useCallback(async (jobId: string) => {
    setSelectedJobId(jobId);
    setIsLoadingDetail(true);
    setActiveTab("APPLICANTS");

    try {
      const res = await fetch(`/api/institute/jobs/${jobId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setJobDetailData(json);
        }
      }
    } catch {
      // Handle silently
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const closeModal = () => {
    setSelectedJobId(null);
    setJobDetailData(null);
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-neutral-950 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
        <Header />

        <main className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                Campus Hiring Jobs Marketplace
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Active Corporate Partner Openings & Institute Student Applicant Metrics ({jobs.length} Opportunities Listed)
              </p>
            </div>

            <Badge variant="outline" className="font-mono text-xs px-3 py-1 border-neutral-300 bg-white">
              <Briefcase className="w-3.5 h-3.5 text-neutral-950 inline mr-1.5" />
              CORPORATE PARTNER DISCOVERY
            </Badge>
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
            <div className="py-16 text-center text-xs font-mono text-neutral-400">Loading active hiring openings...</div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  onClick={() => openJobModal(job.id)}
                  className="border border-neutral-200/90 rounded-3xl bg-white p-6 shadow-xs hover:border-neutral-400 hover:shadow-md transition-all space-y-5 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500 font-medium">{job.company}</div>
                          <h3 className="text-base font-extrabold text-neutral-950 tracking-tight leading-snug group-hover:text-neutral-700 transition-colors">
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
                      {job.salary && (
                        <span className="px-2.5 py-1 bg-neutral-100 text-neutral-950 font-bold rounded-lg flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" /> {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-950">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>{job.instituteApplicantsCount} Campus Applicants</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openJobModal(job.id);
                      }}
                      className="text-xs font-bold text-neutral-950 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Applicants & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-mono text-neutral-400">No matching campus openings found.</div>
          )}
        </main>
      </div>

      {/* Interactive Job & Campus Applicant Roster Modal */}
      {selectedJobId && (
        <div
          className="fixed inset-0 z-[9999] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          data-lenis-prevent="true"
        >
          <div className="relative w-full max-w-4xl bg-white border border-neutral-200 rounded-3xl shadow-2xl z-10 text-neutral-950 font-sans p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-5 shrink-0">
              {isLoadingDetail ? (
                <div className="text-xs font-mono text-neutral-400">Fetching job posting & applicant details...</div>
              ) : jobDetailData ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-neutral-950 text-white font-mono text-[10px] font-bold rounded-md uppercase">
                      {jobDetailData.job.company}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Posted {new Date(jobDetailData.job.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                    {jobDetailData.job.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 font-medium pt-1">
                    <span><MapPin className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />{jobDetailData.job.location} ({jobDetailData.job.workMode})</span>
                    <span>•</span>
                    <span>{jobDetailData.job.type}</span>
                    <span>•</span>
                    <span>Experience: {jobDetailData.job.experience}</span>
                    {jobDetailData.job.salary && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-neutral-950">{jobDetailData.job.salary}</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 font-mono">Job Details</div>
              )}

              <button
                onClick={closeModal}
                className="p-2 rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            {jobDetailData && (
              <div className="flex items-center gap-3 border-b border-neutral-200 pb-3 shrink-0">
                <button
                  onClick={() => setActiveTab("APPLICANTS")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                    activeTab === "APPLICANTS"
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Campus Student Applicants ({jobDetailData.applicants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("DETAILS")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                    activeTab === "DETAILS"
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Job Description & Requirements</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
              {isLoadingDetail ? (
                <div className="py-20 text-center text-xs font-mono text-neutral-400">Loading details...</div>
              ) : jobDetailData ? (
                <>
                  {activeTab === "APPLICANTS" && (
                    <div className="space-y-4">
                      {jobDetailData.applicants.length > 0 ? (
                        <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                          <table className="w-full text-left text-xs text-neutral-900 font-sans">
                            <thead className="bg-neutral-100 border-b border-neutral-200 font-mono text-[11px] uppercase text-neutral-500 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3">Student Candidate</th>
                                <th className="px-4 py-3">Email Address</th>
                                <th className="px-4 py-3">Department & Course</th>
                                <th className="px-4 py-3">Applied On</th>
                                <th className="px-4 py-3 text-right">Application Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {jobDetailData.applicants.map((app) => (
                                <tr key={app.id} className="hover:bg-neutral-50/80 transition-colors">
                                  <td className="px-4 py-3 font-bold text-neutral-950">
                                    <Link
                                      href={`/institute/students/${app.studentId}`}
                                      className="hover:underline flex items-center gap-1.5"
                                    >
                                      <span>{app.studentName}</span>
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-neutral-600">{app.studentEmail}</td>
                                  <td className="px-4 py-3 font-medium">
                                    {app.department} • <span className="font-mono text-neutral-500">{app.course} ({app.graduationYear})</span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-neutral-500">
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="px-2.5 py-1 bg-neutral-950 text-white rounded-full font-mono text-[10px] font-bold uppercase inline-block">
                                      {app.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-16 text-center border border-dashed border-neutral-300 rounded-3xl p-8 space-y-2">
                          <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                          <p className="text-sm font-bold text-neutral-950">No Campus Applicants Yet</p>
                          <p className="text-xs text-neutral-500">
                            No students from your educational institution have submitted applications for this corporate opening yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "DETAILS" && (
                    <div className="space-y-6 text-xs text-neutral-800 leading-relaxed font-sans">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-neutral-950 uppercase tracking-wider font-mono">
                          Job Description
                        </h4>
                        <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl whitespace-pre-wrap">
                          {jobDetailData.job.description}
                        </div>
                      </div>

                      {jobDetailData.job.requirements && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-neutral-950 uppercase tracking-wider font-mono">
                            Candidate Requirements & Skills
                          </h4>
                          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl whitespace-pre-wrap">
                            {jobDetailData.job.requirements}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono text-neutral-400">Vantory Institutional Partner Network</span>
              <Button variant="outline" size="sm" onClick={closeModal} className="font-bold text-xs">
                Close Modal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
