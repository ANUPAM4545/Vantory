"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Building2, Sparkles, ArrowRight, Globe, MapPin, Calendar, Users, ShieldCheck } from "lucide-react";

export function CompanyOnboardingModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Onboarding Form States
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Software & Technology");
  const [description, setDescription] = useState("");
  const [establishedYear, setEstablishedYear] = useState<number | string>(2024);
  const [companySize, setCompanySize] = useState("11-50 Employees");
  const [location, setLocation] = useState("Varanasi, India");
  const [website, setWebsite] = useState("");

  const checkOnboardingStatus = useCallback(async () => {
    try {
      // Check current user role first to prevent 403 Forbidden for candidate/student sessions
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) return;
      const authJson = await authRes.json();
      if (!authJson.success || authJson.user?.role !== "COMPANY_ADMIN") return;

      const res = await fetch("/api/company/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          // If company is not onboarded yet, open the onboarding wizard
          if (!json.profile.isOnboarded) {
            setCompanyName(json.profile.companyName || "");
            setWebsite(json.profile.website || "");
            setIndustry(json.profile.industry || "Software & Technology");
            setLocation(json.profile.location || "Varanasi, India");
            setEstablishedYear(json.profile.establishedYear || 2024);
            setCompanySize(json.profile.companySize || "11-50 Employees");
            setDescription(json.profile.description || "");
            setIsOpen(true);
          }
        }
      }
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry.trim() || "Software & Technology",
          description: description.trim(),
          establishedYear: Number(establishedYear) || 2024,
          companySize: companySize || "11-50 Employees",
          location: location.trim() || "Remote",
          website: website.trim(),
          isOnboarded: true,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        window.location.reload();
      }
    } catch {
      // Handle silently
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-neutral-900 selection:text-white custom-scrollbar"
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
    >
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl z-10 text-neutral-950 font-sans p-6 sm:p-8 space-y-6 my-auto">
        {/* Onboarding Banner Header */}
        <div className="space-y-3 border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-neutral-100 text-neutral-900 border border-neutral-200 uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 inline" />
                <span>Employer Setup — Step 1</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                Welcome to SkillAssociate Corporate!
              </h2>
            </div>
          </div>
          <p className="text-xs text-neutral-500 font-mono">
            Tell us about your company to activate your verified hiring profile and post engineering openings.
          </p>
        </div>

        <form onSubmit={handleSubmitOnboarding} className="space-y-5 text-xs">
          {/* Question 1: Company Name & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-neutral-600 uppercase block font-bold">
                Company Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. SkillAssociate Tech Ltd."
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-bold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-neutral-600 uppercase block font-bold">
                Industry Sector
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. AI & Software Engineering"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>
          </div>

          {/* Question 2: What Does Company Do / Description */}
          <div className="space-y-1.5">
            <label className="font-mono text-neutral-600 uppercase block font-bold">
              What does your company do? (Mission & Overview) *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your company builds, your core mission, product focus, and tech stack..."
              className="w-full bg-white border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-950 font-mono focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 leading-relaxed"
            />
          </div>

          {/* Question 3: Established Year & Company Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-neutral-600 uppercase block font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Established Year</span>
              </label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                placeholder="e.g. 2020"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-bold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-neutral-600 uppercase block font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>Company Size</span>
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-bold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              >
                <option value="1-10 Employees">1-10 Employees</option>
                <option value="11-50 Employees">11-50 Employees</option>
                <option value="51-200 Employees">51-200 Employees</option>
                <option value="201-500 Employees">201-500 Employees</option>
                <option value="500+ Employees">500+ Employees</option>
              </select>
            </div>
          </div>

          {/* Question 4: Headquarters Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-neutral-600 uppercase block font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>Headquarters Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Varanasi, India or Remote"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-neutral-600 uppercase block font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span>Corporate Website URL</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://skillassociate.dev"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>
          </div>

          {/* Submission Action */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-neutral-950" />
              <span>You can edit these company details anytime in Company Profile</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !companyName.trim() || !description.trim()}
              className="px-6 py-3 bg-neutral-950 text-white font-extrabold text-xs rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <span>{isSubmitting ? "Saving Company Profile..." : "Complete Setup & Launch Dashboard"}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
