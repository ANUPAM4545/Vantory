import test from "node:test";
import assert from "node:assert";
import {
  calculateStudentReadiness,
  aggregateInstitutionFunnel,
} from "../lib/institute/readiness-engine";

test("Placement Readiness Engine - Calculates Placement Ready when all 4 dimensions are satisfied", () => {
  const metrics = {
    profileCompletionScore: 90,
    resumesCount: 2,
    atsScansCount: 3,
    averageAtsScore: 85,
    interviewsCount: 2,
    averageInterviewScore: 78,
  };

  const readiness = calculateStudentReadiness(metrics);
  assert.strictEqual(readiness.isProfileReady, true);
  assert.strictEqual(readiness.isResumeReady, true);
  assert.strictEqual(readiness.isAtsReady, true);
  assert.strictEqual(readiness.isInterviewReady, true);
  assert.strictEqual(readiness.isPlacementReady, true);
  assert.strictEqual(readiness.readinessCategory, "Placement Ready");
});

test("Placement Readiness Engine - Calculates Needs Improvement when ATS average is below threshold", () => {
  const metrics = {
    profileCompletionScore: 85,
    resumesCount: 1,
    atsScansCount: 1,
    averageAtsScore: 60, // Below 75 threshold
    interviewsCount: 1,
    averageInterviewScore: 75,
  };

  const readiness = calculateStudentReadiness(metrics);
  assert.strictEqual(readiness.isAtsReady, false);
  assert.strictEqual(readiness.isPlacementReady, false);
  assert.strictEqual(readiness.readinessCategory, "Needs Improvement");
});

test("Placement Readiness Engine - Calculates Not Ready when profile is incomplete and resumes count is 0", () => {
  const metrics = {
    profileCompletionScore: 30,
    resumesCount: 0,
    atsScansCount: 0,
    averageAtsScore: 0,
    interviewsCount: 0,
    averageInterviewScore: 0,
  };

  const readiness = calculateStudentReadiness(metrics);
  assert.strictEqual(readiness.isPlacementReady, false);
  assert.strictEqual(readiness.readinessCategory, "Not Ready");
});

test("Placement Readiness Engine - Aggregates institution placement funnel correctly", () => {
  const studentList = [
    {
      profileCompletionScore: 90,
      resumesCount: 1,
      atsScansCount: 1,
      averageAtsScore: 80,
      interviewsCount: 1,
      averageInterviewScore: 75,
      isPlaced: true,
    },
    {
      profileCompletionScore: 40,
      resumesCount: 0,
      atsScansCount: 0,
      averageAtsScore: 0,
      interviewsCount: 0,
      averageInterviewScore: 0,
      isPlaced: false,
    },
  ];

  const funnel = aggregateInstitutionFunnel(studentList);
  assert.strictEqual(funnel.totalStudents, 2);
  assert.strictEqual(funnel.placementReadyCount, 1);
  assert.strictEqual(funnel.placedCount, 1);
});
