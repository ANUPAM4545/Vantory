"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Shield, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";

interface UserProfileData {
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function CandidateProfilePage() {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            setUser(json.user);
          }
        }
      } catch {
        // Handle silently
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-950 font-sans p-6 md:p-10 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4 border-b border-neutral-200 pb-6">
          <div className="w-16 h-16 rounded-full bg-neutral-950 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-950">{user?.name || "Candidate"}</h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-900 border border-neutral-200">
                VERIFIED PROFILE
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-mono">{user?.email || "candidate@vantory.com"}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-32 bg-neutral-100 rounded-xl animate-pulse"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span>Full Name</span>
              </span>
              <div className="font-bold text-neutral-950 text-sm">{user?.name || "Not set"}</div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>Account Email</span>
              </span>
              <div className="font-bold text-neutral-950 text-sm">{user?.email || "Not set"}</div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-neutral-500" />
                <span>Platform Role</span>
              </span>
              <div className="font-bold text-neutral-950 text-sm uppercase">{user?.role || "Candidate"}</div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Status</span>
              </span>
              <div className="font-bold text-neutral-950 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                <span>Active Member</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
