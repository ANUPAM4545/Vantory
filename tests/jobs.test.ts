import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../lib/db";
import {
  getFilteredJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  applyToJob,
  getCandidateApplications,
  withdrawApplication,
} from "../lib/jobs/jobs-service";

test("Jobs & Careers - Search & Multi-Facet Filtering with Real Job", async () => {
  // Create a temporary test job
  const testJob = await db.jobPosting.create({
    data: {
      title: "Backend Engineer Test Role",
      company: "TestCompany",
      location: "Bengaluru, India",
      workMode: "Remote",
      type: "Full-time",
      experienceMin: 1,
      experienceMax: 3,
      experience: "1-3 Years",
      salary: "₹10.0 LPA",
      description: "Test role description for backend engineer",
      requirements: "Python, FastAPI",
      skills: "Python, FastAPI",
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    },
  });

  try {
    // Test Search Query
    const searchResult = await getFilteredJobs({ query: "Backend Engineer Test Role" });
    assert.equal(typeof searchResult.activeOpeningsCount, "number");
    assert.equal(searchResult.jobs.length >= 1, true);

    // Test Filter by Job Type (Full-time)
    const ftResult = await getFilteredJobs({ jobType: "Full-time" });
    assert.equal(
      ftResult.jobs.every((j) => j.type === "Full-time"),
      true
    );

    // Fetch by ID
    const fetched = await getJobById(testJob.id);
    assert.equal(fetched?.title, testJob.title);
    assert.equal(fetched?.company, testJob.company);
  } finally {
    // Clean up
    await db.jobPosting.delete({ where: { id: testJob.id } });
  }
});

test("Jobs & Careers - Save & Application Workflow", async () => {
  // Get or create test user
  let user = await db.user.findFirst();
  if (!user) {
    user = await db.user.create({
      data: {
        email: "jobtestcandidate@example.com",
        passwordHash: "hash",
        name: "Test Candidate",
        role: "CANDIDATE",
      },
    });
  }

  // Create temporary test job
  const testJob = await db.jobPosting.create({
    data: {
      title: "Full Stack Test Role",
      company: "TestCompany2",
      location: "Remote",
      workMode: "Remote",
      type: "Full-time",
      description: "Test description",
      requirements: "React, Node.js",
      skills: "React, Node.js",
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    },
  });

  // Create test resume
  let resume = await db.resume.findFirst({ where: { userId: user.id } });
  if (!resume) {
    resume = await db.resume.create({
      data: {
        userId: user.id,
        title: "Test Candidate Resume",
        contentJson: JSON.stringify({ personalInfo: { fullName: user.name } }),
      },
    });
  }

  try {
    // Toggle Save
    const saved = await toggleSaveJob(user.id, testJob.id);
    assert.equal(saved.isSaved, true);

    const savedList = await getSavedJobs(user.id);
    assert.equal(savedList.some((s) => s.id === testJob.id), true);

    // Unsave
    const unsaved = await toggleSaveJob(user.id, testJob.id);
    assert.equal(unsaved.isSaved, false);

    // Apply to Job
    const application = await applyToJob(
      user.id,
      testJob.id,
      resume.id,
      "Excited to apply!"
    );
    assert.equal(application.status, "APPLIED");

    // Prevent duplicate application
    await assert.rejects(
      async () => {
        await applyToJob(user.id, testJob.id, resume.id, "Second try");
      },
      {
        name: "Error",
        message: /Already Applied/,
      }
    );

    // Verify candidate application tracking & withdrawal
    const candidateApps = await getCandidateApplications(user.id);
    assert.equal(candidateApps.applications.length >= 1, true);

    const updatedApp = await withdrawApplication(user.id, application.id);
    assert.equal(updatedApp.status, "WITHDRAWN");
  } finally {
    // Clean up
    await db.jobApplication.deleteMany({ where: { jobId: testJob.id } });
    await db.savedJob.deleteMany({ where: { jobId: testJob.id } });
    await db.jobPosting.delete({ where: { id: testJob.id } });
  }
});
