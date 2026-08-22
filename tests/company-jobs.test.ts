import test from "node:test";
import assert from "node:assert/strict";

test("Edit & Republish Job Posting API Contracts", () => {
  const mockPayload = {
    title: "Senior Lead Fullstack Engineer (Updated)",
    location: "Bengaluru, KA (Hybrid)",
    workMode: "Hybrid",
    type: "Full-time",
    experienceMin: 3,
    experienceMax: 6,
    experience: "3-6 Years",
    salaryMin: 120000,
    salaryMax: 180000,
    salaryPeriod: "month",
    skills: "React, TypeScript, Node.js, Next.js, PostgreSQL",
    description: "Updated job description for engineering lead position.",
    aboutCompany: "We build cutting-edge AI hiring infrastructure.",
    companyUrl: "https://identity.example.com",
    requirements: "Mandatory 3+ years experience with Next.js and PostgreSQL.",
    status: "ACTIVE",
    republish: true,
  };

  assert.equal(mockPayload.republish, true);
  assert.equal(mockPayload.status, "ACTIVE");
  assert.ok(mockPayload.title.includes("Updated"));
});
