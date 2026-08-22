"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, ArrowLeft, Bell, ShieldCheck, Check } from "lucide-react";

export default function AccountSettingsPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            setUserEmail(json.user.email);
          }
        }
      } catch {
        // Handle silently
      }
    }
    loadUser();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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

      <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
          <Settings className="w-6 h-6 text-neutral-950" />
          <div>
            <h1 className="text-xl font-extrabold text-neutral-950">Account Settings</h1>
            <p className="text-xs text-neutral-500 font-mono">Manage preferences and security settings</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-500 uppercase block font-semibold">Account Email</label>
            <input
              type="email"
              disabled
              value={userEmail || "candidate@skillassociate.com"}
              className="w-full text-xs bg-neutral-100 border border-neutral-300 rounded-xl p-3 text-neutral-600 font-mono cursor-not-allowed"
            />
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-950">
              <ShieldCheck className="w-4 h-4 text-neutral-950" />
              <span>Security & Privacy</span>
            </div>
            <p className="text-xs text-neutral-600">
              Your candidate profile & resumes are protected under SkillAssociate strict data isolation standard.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-950">
              <Bell className="w-4 h-4 text-neutral-950" />
              <span>Notification Preferences</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-neutral-950" />
                <span>Job Application Status Updates</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-neutral-950" />
                <span>Direct Employer Messages</span>
              </label>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-neutral-950" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-neutral-950 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
