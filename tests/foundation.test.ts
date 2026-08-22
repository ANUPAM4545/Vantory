import test from "node:test";
import assert from "node:assert";
import { calculateProfileScore } from "../lib/utils";

test("calculateProfileScore computes 100% for a complete profile", () => {
  const profile = {
    headline: "Full Stack Engineer",
    phone: "+1 234 567 8900",
    location: "San Francisco, CA",
    bio: "Passionate developer",
    linkedinUrl: "https://linkedin.com/in/demo",
    college: "Stanford University",
    skillsCount: 5,
    experienceCount: 2,
    educationCount: 1,
  };

  const score = calculateProfileScore(profile);
  assert.strictEqual(score, 100);
});

test("calculateProfileScore computes partial score correctly", () => {
  const profile = {
    headline: "Full Stack Engineer",
    bio: "Passionate developer",
    linkedinUrl: "https://linkedin.com/in/demo",
    skillsCount: 3,
  };

  // headline (15) + bio (15) + linkedinUrl (10) + skillsCount (10) = 50
  const score = calculateProfileScore(profile);
  assert.strictEqual(score, 50);
});

test("calculateProfileScore handles empty profile gracefully", () => {
  const score = calculateProfileScore({});
  assert.strictEqual(score, 0);
});
