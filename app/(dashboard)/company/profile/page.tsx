"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Globe, MapPin, Save } from "lucide-react";

interface CompanyProfileData {
  id: string;
  companyName: string;
  logo?: string;
  website?: string;
  description?: string;
  industry?: string;
  location?: string;
  establishedYear?: number;
  companySize?: string;
  isOnboarded?: boolean;
  verificationStatus: string;
  email: string;
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEstablishedYear, setEditEstablishedYear] = useState<number | string>(2024);
  const [editCompanySize, setEditCompanySize] = useState("11-50 Employees");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/company/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          setProfile(json.profile);
          setEditCompanyName(json.profile.companyName || "");
          setEditWebsite(json.profile.website || "");
          setEditIndustry(json.profile.industry || "Software & Technology");
          setEditLocation(json.profile.location || "Remote");
          setEditEstablishedYear(json.profile.establishedYear || 2024);
          setEditCompanySize(json.profile.companySize || "11-50 Employees");
          setEditDescription(json.profile.description || "");
        }
      }
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: editCompanyName,
          website: editWebsite,
          industry: editIndustry,
          location: editLocation,
          establishedYear: Number(editEstablishedYear) || 2024,
          companySize: editCompanySize,
          description: editDescription,
          isOnboarded: true,
        }),
      });

      if (res.ok) {
        setProfileSaveSuccess(true);
        await loadProfile();
        // Trigger a hard reload of window location or sidebar sync if name updated
        setTimeout(() => {
          setProfileSaveSuccess(false);
          window.location.reload();
        }, 1500);
      }
    } catch {
      // Handle silently
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="w-full space-y-6 selection:bg-neutral-950 selection:text-white font-sans">
      {/* Header Bar */}
      <div className="border-b border-neutral-200 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tight">Edit Company Profile</h1>
          <p className="text-xs text-neutral-500 font-mono">Update corporate employer details visible to candidates across job postings in real-time</p>
        </div>
      </div>

      {/* Main Full Width Profile Form Card */}
      {isLoading ? (
        <div className="w-full h-80 bg-neutral-100 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="w-full bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6">
          {/* Real-time Header Preview */}
          <div className="flex items-center gap-4 p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
            <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white font-mono font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {profile?.logo || editCompanyName?.charAt(0) || "C"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-neutral-950 text-lg md:text-xl">
                  {editCompanyName || "Company Name"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-200 text-neutral-900 border border-neutral-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950 inline" />
                  <span>VERIFIED EMPLOYER</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-mono text-neutral-500">
                {editWebsite && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{editWebsite}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{editLocation || "Remote"}</span>
                </span>
                <span>•</span>
                <span>{editIndustry || "Software & Technology"}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            {profileSaveSuccess && (
              <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-950 flex items-center gap-2 font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
                <span>Company profile updated successfully! Real-time changes applied.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-neutral-500 uppercase block font-semibold">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  placeholder="e.g. SkillAssociate Corp"
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-bold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-neutral-500 uppercase block font-semibold">Corporate Website</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-neutral-500 uppercase block font-semibold">Industry Sector</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  placeholder="e.g. Software & Technology, Fintech, Healthcare"
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-neutral-500 uppercase block font-semibold">Headquarters Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India or San Francisco, CA"
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-neutral-500 uppercase block font-semibold">Established Year</label>
                <input
                  type="number"
                  value={editEstablishedYear}
                  onChange={(e) => setEditEstablishedYear(e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-neutral-500 uppercase block font-semibold">Company Size</label>
                <select
                  value={editCompanySize}
                  onChange={(e) => setEditCompanySize(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                >
                  <option value="1-10 Employees">1-10 Employees</option>
                  <option value="11-50 Employees">11-50 Employees</option>
                  <option value="51-200 Employees">51-200 Employees</option>
                  <option value="201-500 Employees">201-500 Employees</option>
                  <option value="500+ Employees">500+ Employees</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-neutral-500 uppercase block font-semibold">Company Description & Mission</label>
              <textarea
                rows={5}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your company mission, tech stack, engineering culture, and work environment..."
                className="w-full bg-white border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-950 font-mono focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 leading-relaxed"
              />
            </div>

            <div className="pt-3 flex justify-end border-t border-neutral-200">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 bg-neutral-950 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{isSavingProfile ? "Saving Real-Time Profile..." : "Save Company Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
