import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function calculateProfileScore(profile: {
  headline?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  college?: string | null;
  skillsCount?: number;
  experienceCount?: number;
  educationCount?: number;
}): number {
  let score = 0;
  if (profile.headline) score += 15;
  if (profile.phone) score += 10;
  if (profile.location) score += 10;
  if (profile.bio) score += 15;
  if (profile.linkedinUrl || profile.githubUrl) score += 10;
  if (profile.college) score += 10;
  if (profile.skillsCount && profile.skillsCount > 0) score += 10;
  if (profile.experienceCount && profile.experienceCount > 0) score += 10;
  if (profile.educationCount && profile.educationCount > 0) score += 10;
  return Math.min(100, score);
}
