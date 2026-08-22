import test from "node:test";
import assert from "node:assert";
import { escapeLatex } from "../lib/resume/latex/escapeLatex";
import { generateLatexSource } from "../lib/resume/latex/renderer";
import { parseResumeContent, serializeResumeContent } from "../lib/resume/serialization";
import { ResumeData, defaultResumeSettings } from "../lib/resume/types";

test("LaTeX Special Characters Escaping", () => {
  assert.strictEqual(escapeLatex("John & Jane"), "John \\& Jane");
  assert.strictEqual(escapeLatex("50%"), "50\\%");
  assert.strictEqual(escapeLatex("C++ & $100"), "C++ \\& \\$100");
  assert.strictEqual(escapeLatex("Node.js_Developer"), "Node.js\\_Developer");
  assert.strictEqual(escapeLatex("Issue #123"), "Issue \\#123");
  assert.strictEqual(escapeLatex("{code}"), "\\{code\\}");
});

test("Resume Data Serialization & Deserialization", () => {
  const sampleData: ResumeData = {
    title: "Test Resume",
    personalInfo: {
      fullName: "Alex Morgan",
      headline: "Software Engineer",
      email: "alex@example.com",
      phone: "+1 555 0000",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/alex",
      github: "https://github.com/alex",
      portfolio: "https://alex.dev",
      leetcode: "https://leetcode.com/alex",
    },
    summary: "Passionate developer.",
    skills: [
      { id: "1", category: "Languages", skills: ["Python", "TypeScript"] },
    ],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    settings: defaultResumeSettings,
  };

  const serialized = serializeResumeContent(sampleData);
  assert.ok(typeof serialized === "string");

  const parsed = parseResumeContent(serialized);
  assert.strictEqual(parsed.personalInfo.fullName, "Alex Morgan");
  assert.strictEqual(parsed.skills.length, 1);
  assert.strictEqual(parsed.skills[0].category, "Languages");
});

test("LaTeX Document Template Source Generation", () => {
  const sampleData: ResumeData = {
    title: "Test Resume",
    personalInfo: {
      fullName: "Alex Morgan",
      headline: "Full Stack Engineer",
      email: "alex@example.com",
      phone: "+1 555 123 4567",
      location: "Bengaluru, India",
      linkedin: "",
      github: "",
      portfolio: "",
      leetcode: "",
    },
    summary: "Experienced developer.",
    skills: [{ id: "1", category: "Languages", skills: ["Python", "C++"] }],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    settings: defaultResumeSettings,
  };

  const latex = generateLatexSource(sampleData);
  assert.ok(latex.includes("\\documentclass[10pt,a4paper]{article}"));
  assert.ok(latex.includes("Alex Morgan"));
  assert.ok(latex.includes("Python, C++"));
  assert.ok(latex.includes("\\end{document}"));
});
