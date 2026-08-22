import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../lib/db";
import {
  createCompanyJob,
  getCompanyJobs,
  getCompanyApplications,
  updateApplicationStatusByCompany,
  deleteCompanyJob,
} from "../lib/company/company-service";
import { applyToJob } from "../lib/jobs/jobs-service";

test("Company Portal - Job Creation, Ownership & Candidate Pipeline Workflow", async () => {
  // 1. Setup Company User & Candidate User
  let companyUser = await db.user.findFirst({ where: { role: "COMPANY_ADMIN" } });
  if (!companyUser) {
    companyUser = await db.user.create({
      data: {
        email: "testcompanyadmin@example.com",
        passwordHash: "hash",
        name: "TestCorp",
        role: "COMPANY_ADMIN",
      },
    });
    await db.companyProfile.create({
      data: {
        userId: companyUser.id,
        companyName: "TestCorp",
        verificationStatus: "VERIFIED",
      },
    });
  }

  let candidateUser = await db.user.findFirst({ where: { role: "CANDIDATE" } });
  if (!candidateUser) {
    candidateUser = await db.user.create({
      data: {
        email: "companytestcandidate@example.com",
        passwordHash: "hash",
        name: "Test Candidate",
        role: "CANDIDATE",
      },
    });
  }

  let candidateResume = await db.resume.findFirst({ where: { userId: candidateUser.id } });
  if (!candidateResume) {
    candidateResume = await db.resume.create({
      data: {
        userId: candidateUser.id,
        title: "Test Candidate Resume",
        contentJson: JSON.stringify({ personalInfo: { fullName: candidateUser.name } }),
      },
    });
  }

  let createdJobId: string | null = null;
  let createdAppId: string | null = null;

  try {
    // 2. Create Job as Company
    const job = await createCompanyJob(companyUser.id, {
      title: "Senior Fullstack Developer Test",
      location: "Bengaluru, India",
      workMode: "Remote",
      type: "Full-time",
      experienceMin: 2,
      experienceMax: 5,
      description: "Test description for fullstack role",
      requirements: "React, Node.js, TypeScript",
      skills: "React, Node.js, TypeScript",
    });

    createdJobId = job.id;
    assert.equal(job.company, "TestCorp");
    assert.equal(job.companyUserId, companyUser.id);
    assert.equal(job.status, "ACTIVE");

    // 3. Verify Company Jobs List
    const companyJobs = await getCompanyJobs(companyUser.id);
    assert.equal(companyJobs.some((j) => j.id === job.id), true);

    // 4. Candidate Applies to Company Job
    const app = await applyToJob(candidateUser.id, job.id, candidateResume.id, "Excited for TestCorp!");
    createdAppId = app.id;
    assert.equal(app.status, "APPLIED");

    // 5. Company Fetches Applications
    const companyApps = await getCompanyApplications(companyUser.id);
    assert.equal(companyApps.some((a) => a.id === app.id), true);

    // 6. Test Valid Status Transitions: APPLIED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW -> OFFERED
    const reviewApp = await updateApplicationStatusByCompany(companyUser.id, app.id, "UNDER_REVIEW", "Reviewing resume");
    assert.equal(reviewApp.status, "UNDER_REVIEW");

    const shortlistApp = await updateApplicationStatusByCompany(companyUser.id, app.id, "SHORTLISTED", "Passed review");
    assert.equal(shortlistApp.status, "SHORTLISTED");

    const interviewApp = await updateApplicationStatusByCompany(companyUser.id, app.id, "INTERVIEW", "Schedule tech call");
    assert.equal(interviewApp.status, "INTERVIEW");

    const offerApp = await updateApplicationStatusByCompany(companyUser.id, app.id, "OFFERED", "Extending offer");
    assert.equal(offerApp.status, "OFFERED");

    // 7. Test Invalid Status Transition Matrix rejection
    await assert.rejects(
      async () => {
        // OFFERED -> UNDER_REVIEW is illegal in matrix
        await updateApplicationStatusByCompany(companyUser.id, app.id, "UNDER_REVIEW", "Illegal jump");
      },
      {
        name: "Error",
        message: /Invalid status transition/,
      }
    );

    // 8. Delete / Soft-close job safety check
    const closeResult = await deleteCompanyJob(companyUser.id, job.id);
    assert.equal(closeResult.action, "CLOSED");
  } finally {
    // Clean up
    if (createdJobId) {
      await db.jobApplication.deleteMany({ where: { jobId: createdJobId } });
      await db.jobPosting.deleteMany({ where: { id: createdJobId } });
    }
  }
});
