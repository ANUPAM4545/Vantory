"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { ResumePersonalInfo } from "@/lib/resume/types";

export interface PersonalInfoEditorProps {
  info: ResumePersonalInfo;
  onChange: (info: ResumePersonalInfo) => void;
}

export function PersonalInfoEditor({ info, onChange }: PersonalInfoEditorProps) {
  const handleChange = (field: keyof ResumePersonalInfo, value: string) => {
    onChange({
      ...info,
      [field]: value,
    });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Full Name"
        placeholder="Alex Morgan"
        value={info.fullName}
        onChange={(e) => handleChange("fullName", e.target.value)}
        required
      />

      <Input
        label="Professional Title"
        placeholder="Software Engineer / AI & Full-Stack Developer"
        value={info.headline}
        onChange={(e) => handleChange("headline", e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Email Address"
          type="email"
          placeholder="alex@example.com"
          value={info.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
        <Input
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          value={info.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      <Input
        label="Location"
        placeholder="San Francisco, CA / Remote"
        value={info.location}
        onChange={(e) => handleChange("location", e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="LinkedIn Profile"
          placeholder="https://linkedin.com/in/username"
          value={info.linkedin}
          onChange={(e) => handleChange("linkedin", e.target.value)}
        />
        <Input
          label="GitHub Profile"
          placeholder="https://github.com/username"
          value={info.github}
          onChange={(e) => handleChange("github", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Portfolio URL"
          placeholder="https://alexmorgan.dev"
          value={info.portfolio}
          onChange={(e) => handleChange("portfolio", e.target.value)}
        />
        <Input
          label="LeetCode / CodeProfile"
          placeholder="https://leetcode.com/u/username"
          value={info.leetcode}
          onChange={(e) => handleChange("leetcode", e.target.value)}
        />
      </div>
    </div>
  );
}
