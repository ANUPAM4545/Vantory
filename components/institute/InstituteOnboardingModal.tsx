"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GraduationCap, ArrowRight, Globe, MapPin, Calendar, Mail, Phone, ShieldCheck } from "lucide-react";

export function InstituteOnboardingModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Onboarding Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [establishedYear, setEstablishedYear] = useState<number | string>(2010);
  const [location, setLocation] = useState("Varanasi, India");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const checkOnboardingStatus = useCallback(async () => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/company")) {
      setIsLoading(false);
      return;
    }

    try {
      // Check current user role first to prevent 403 Forbidden for candidate/student sessions
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) return;
      const authJson = await authRes.json();
      if (
        !authJson.success ||
        !authJson.user ||
        (authJson.user?.role !== "INSTITUTE_ADMIN" && authJson.user?.role !== "SUPER_ADMIN")
      ) {
        return;
      }

      const userId = authJson.user.id;
      if (typeof window !== "undefined" && sessionStorage.getItem(`institute_onboarded_${userId}`) === "true") {
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/institute/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          // If institute is not onboarded yet, open the onboarding wizard
          if (!json.profile.isOnboarded) {
            setName(json.profile.name || "");
            setWebsite(json.profile.website || "");
            setLocation(json.profile.location || "Varanasi, India");
            setEstablishedYear(json.profile.establishedYear || 2010);
            setContactEmail(json.profile.contactEmail || authJson.user?.email || "");
            setContactPhone(json.profile.contactPhone || "");
            setDescription(json.profile.description || "");
            setIsOpen(true);
          } else {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(`institute_onboarded_${userId}`, "true");
            }
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
    if (!name.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institute/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          establishedYear: Number(establishedYear) || 2010,
          location: location.trim() || "Main Campus",
          website: website.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
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
      className="fixed inset-0 z-[9999] bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-neutral-900 selection:text-white custom-scrollbar"
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
    >
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl z-10 text-neutral-950 font-sans p-6 sm:p-8 space-y-6 my-auto">
        {/* Onboarding Banner Header */}
        <div className="space-y-3 border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-950 inline-block animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-950 inline" />
              <span>Campus Setup — Step 1</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
            Welcome to Vantory Institute Portal!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            Configure your educational institution details to enable automated campus placement drives, student roster imports, and placement readiness tracking.
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmitOnboarding} className="space-y-5 text-left">
          {/* Institution Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider block">
              Official Institution Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Banaras Hindu University / IIT Varanasi"
              className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-bold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          {/* Grid: Established Year & Campus Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Established Year</span>
              </label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                placeholder="2010"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-semibold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>Campus Location *</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Varanasi, Uttar Pradesh"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-semibold focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>
          </div>

          {/* Grid: Contact Email & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>Placement Contact Email *</span>
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="placement@campus.edu"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>Placement Contact Phone</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>
          </div>

          {/* Website URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>Official Website URL</span>
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://bhu.ac.in"
              className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-medium focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          {/* Description / Mission */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider block">
              Placement Cell Overview & Mission *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a summary of departments, degree courses, and training programs offered by your institution..."
              className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-950 font-normal focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          {/* Verification Badge Notice */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-neutral-950 shrink-0" />
            <p className="text-[11px] text-neutral-500 font-sans leading-tight">
              By completing onboarding, your institution will be granted a <strong className="text-neutral-950 font-semibold">VERIFIED INSTITUTION</strong> status badge on Vantory placement drives.
            </p>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !description.trim()}
              className="w-full py-3.5 bg-neutral-950 text-white font-extrabold text-xs sm:text-sm rounded-xl hover:bg-neutral-800 transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Saving Institution Profile..." : "Complete Setup & Launch Institute Portal"}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
