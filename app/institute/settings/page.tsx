"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Save } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstituteProfile {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  location: string;
  contactEmail: string;
  contactPhone: string | null;
  establishedYear: number;
  verificationStatus: string;
  adminsCount: number;
}

export default function InstituteSettingsPage() {
  const [profile, setProfile] = useState<InstituteProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [establishedYear, setEstablishedYear] = useState<number>(2010);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/institute/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.profile) {
            const p = json.profile;
            setProfile(p);
            setName(p.name || "");
            setWebsite(p.website || "");
            setDescription(p.description || "");
            setLocation(p.location || "Main Campus");
            setContactEmail(p.contactEmail || "");
            setContactPhone(p.contactPhone || "");
            setEstablishedYear(p.establishedYear || 2010);
          }
        }
      } catch {
        // Handle error
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/institute/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          website,
          description,
          location,
          contactEmail,
          contactPhone,
          establishedYear: Number(establishedYear),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setMessage("Institute profile updated successfully.");
        setProfile(json.profile);
      } else {
        setMessage(`Failed to update profile: ${json.error || "Invalid parameters."}`);
      }
    } catch {
      setMessage("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-neutral-950 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                Institute Profile & Settings
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Manage Campus Identity, Verification Badges & Authorized Administrators
              </p>
            </div>

            <Badge variant="dark" className="font-mono text-xs w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {profile?.verificationStatus || "VERIFIED"}
            </Badge>
          </div>

          <Card className="border border-neutral-200/90 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {message && (
              <div className="p-3 bg-neutral-100 border border-neutral-950 text-neutral-950 text-xs font-mono font-bold rounded-xl">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institute Name *"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Campus Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Main Campus, Boston, MA"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://campus.edu"
                />

                <Input
                  label="Established Year"
                  type="number"
                  value={establishedYear.toString()}
                  onChange={(e) => setEstablishedYear(parseInt(e.target.value, 10) || 2010)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Placement Office Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />

                <Input
                  label="Placement Contact Phone"
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                  Institute Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of your institution and academic programs..."
                  className="w-full p-3 border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:border-neutral-950 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
