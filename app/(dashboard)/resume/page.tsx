"use client";

import React, { useEffect, useState } from "react";
import { ResumeWorkspace } from "@/components/resume/ResumeWorkspace";
import { ResumeData, emptyResumeData } from "@/lib/resume/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch("/api/resumes");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load resume data.");
        }

        if (json.resumes && json.resumes.length > 0) {
          setResumeData(json.resumes[0].data);
        } else {
          setResumeData(emptyResumeData);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load resume data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadResume();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-6">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-3 shadow-subtle">
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-900">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-neutral-950">Unable to load Resume</h3>
        <p className="text-xs text-neutral-500">{error}</p>
      </div>
    );
  }

  return <ResumeWorkspace initialResume={resumeData || emptyResumeData} />;
}
