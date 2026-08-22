"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";

export interface SummaryEditorProps {
  summary: string;
  onChange: (summary: string) => void;
}

export function SummaryEditor({ summary, onChange }: SummaryEditorProps) {
  return (
    <div className="space-y-2">
      <Textarea
        label="Professional Summary"
        placeholder="High-performing Software Engineer with expertise in building scalable full-stack web applications, RESTful APIs, and AI integrations..."
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        description="Provide a concise 2-3 sentence overview highlighting core technical expertise and achievements."
      />
    </div>
  );
}
