import { db } from "@/lib/db";
import { ApplicationState } from "@prisma/client";
import { ensureSeedJobsExist } from "./seed-jobs";

export interface JobFilterParams {
  query?: string;
  jobType?: string;
  workMode?: string;
  experience?: string;
  location?: string;
  company?: string;
  skills?: string;
  salaryRange?: string;
  datePosted?: string; // "today", "3days", "7days", "30days"
  sortBy?: "recent" | "relevance" | "salary" | "experience";
  page?: number;
  limit?: number;
}

export async function getFilteredJobs(params: JobFilterParams, userId?: string) {
  await ensureSeedJobsExist();

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
  };

  // Search query (title, company, skills, location, description)
  if (params.query && params.query.trim()) {
    const q = params.query.trim();
    where.OR = [
      { title: { contains: q } },
      { company: { contains: q } },
      { skills: { contains: q } },
      { location: { contains: q } },
      { description: { contains: q } },
    ];
  }

  // Job Type Filter
  if (params.jobType && params.jobType !== "ALL") {
    where.type = { equals: params.jobType };
  }

  // Work Mode Filter
  if (params.workMode && params.workMode !== "ALL") {
    where.workMode = { equals: params.workMode };
  }

  // Experience Filter
  if (params.experience && params.experience !== "ALL") {
    where.experience = { contains: params.experience };
  }

  // Location Filter
  if (params.location && params.location !== "ALL") {
    where.location = { contains: params.location };
  }

  // Company Filter
  if (params.company && params.company !== "ALL") {
    where.company = { contains: params.company };
  }

  // Skills Filter
  if (params.skills && params.skills !== "ALL") {
    where.skills = { contains: params.skills };
  }

  // Salary Range Filter
  if (params.salaryRange && params.salaryRange !== "ALL") {
    if (params.salaryRange === "0-25k") {
      where.salaryMax = { lte: 25000 };
    } else if (params.salaryRange === "25k-50k") {
      where.salaryMin = { gte: 25000 };
      where.salaryMax = { lte: 50000 };
    } else if (params.salaryRange === "50k-100k") {
      where.salaryMin = { gte: 50000 };
      where.salaryMax = { lte: 100000 };
    } else if (params.salaryRange === "100k+") {
      where.salaryMin = { gte: 100000 };
    }
  }

  // Date Posted Filter
  if (params.datePosted && params.datePosted !== "ALL") {
    const now = new Date();
    const pastDate = new Date();
    if (params.datePosted === "today") pastDate.setDate(now.getDate() - 1);
    else if (params.datePosted === "3days") pastDate.setDate(now.getDate() - 3);
    else if (params.datePosted === "7days") pastDate.setDate(now.getDate() - 7);
    else if (params.datePosted === "30days") pastDate.setDate(now.getDate() - 30);
    
    where.postedAt = { gte: pastDate };
  }

  // Sorting
  let orderBy: Record<string, string> = { postedAt: "desc" };
  if (params.sortBy === "salary") {
    orderBy = { salaryMax: "desc" };
  } else if (params.sortBy === "experience") {
    orderBy = { experienceMin: "asc" };
  } else if (params.sortBy === "recent" || !params.sortBy) {
    orderBy = { postedAt: "desc" };
  }

  const [jobs, totalCount, activeOpeningsCount] = await Promise.all([
    db.jobPosting.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    db.jobPosting.count({ where }),
    db.jobPosting.count({
      where: { status: "ACTIVE", verificationStatus: "VERIFIED" },
    }),
  ]);

  // Fetch saved status & application status if userId is authenticated
  let savedJobIds = new Set<string>();
  let appliedJobIds = new Set<string>();

  if (userId) {
    const [savedRecords, applicationRecords] = await Promise.all([
      db.savedJob.findMany({
        where: { userId },
        select: { jobId: true },
      }),
      db.jobApplication.findMany({
        where: { userId },
        select: { jobId: true },
      }),
    ]);

    savedJobIds = new Set(savedRecords.map((s) => s.jobId));
    appliedJobIds = new Set(applicationRecords.map((a) => a.jobId));
  }

  const formattedJobs = jobs.map((job) => ({
    ...job,
    isSaved: savedJobIds.has(job.id),
    hasApplied: appliedJobIds.has(job.id),
  }));

  return {
    jobs: formattedJobs,
    totalCount,
    activeOpeningsCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    limit,
  };
}

export async function getJobById(id: string, userId?: string) {
  const [job, savedRecord, appRecord] = await Promise.all([
    db.jobPosting.findUnique({
      where: { id },
    }),
    userId
      ? db.savedJob.findUnique({
          where: { userId_jobId: { userId, jobId: id } },
        })
      : null,
    userId
      ? db.jobApplication.findUnique({
          where: { userId_jobId: { userId, jobId: id } },
        })
      : null,
  ]);

  if (!job) return null;

  return {
    ...job,
    isSaved: Boolean(savedRecord),
    hasApplied: Boolean(appRecord),
    existingApplicationId: appRecord?.id || null,
  };
}

export async function toggleSaveJob(userId: string, jobId: string) {
  const existing = await db.savedJob.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });

  if (existing) {
    await db.savedJob.delete({
      where: { id: existing.id },
    });

    await db.activityLog.create({
      data: {
        userId,
        type: "JOB_UNSAVED",
        title: "Unsaved Job Posting",
        detail: `Unsaved job ID ${jobId}`,
      },
    });

    return { isSaved: false };
  } else {
    await db.savedJob.create({
      data: { userId, jobId },
    });

    await db.activityLog.create({
      data: {
        userId,
        type: "JOB_SAVED",
        title: "Saved Job Posting",
        detail: `Saved job ID ${jobId}`,
      },
    });

    return { isSaved: true };
  }
}

export async function getSavedJobs(userId: string) {
  const savedRecords = await db.savedJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
    },
  });

  return savedRecords.map((s) => ({
    savedId: s.id,
    savedAt: s.createdAt.toISOString(),
    ...s.job,
  }));
}

export async function applyToJob(
  userId: string,
  jobId: string,
  resumeId: string,
  coverNote?: string
) {
  // 1. Verify Job Availability & Status
  const job = await db.jobPosting.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error("Job posting not found.");
  }
  if (job.status !== "ACTIVE") {
    throw new Error(`Cannot apply. Job posting is ${job.status.toLowerCase()}.`);
  }
  if (job.verificationStatus !== "VERIFIED") {
    throw new Error("Cannot apply. Job posting is pending verification.");
  }
  if (job.expiresAt && job.expiresAt < new Date()) {
    throw new Error("Cannot apply. Job posting has expired.");
  }

  // 2. Prevent Duplicate Application
  const existingApp = await db.jobApplication.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  if (existingApp) {
    throw new Error("Already Applied. You have already submitted an application for this role.");
  }

  // 3. Verify Resume Ownership
  const resume = await db.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) {
    throw new Error("Selected resume not found or does not belong to candidate.");
  }

  // 4. Build Initial Application Timeline
  const initialTimeline = [
    {
      status: "APPLIED",
      title: "Application Submitted",
      timestamp: new Date().toISOString(),
      note: "Application submitted with Vantory Resume.",
    },
  ];

  // 5. Persist JobApplication
  const application = await db.jobApplication.create({
    data: {
      userId,
      jobId,
      resumeId,
      coverNote: coverNote ? coverNote.trim().slice(0, 2000) : null,
      status: ApplicationState.APPLIED,
      timelineJson: JSON.stringify(initialTimeline),
    },
    include: {
      job: true,
      resume: true,
    },
  });

  // 6. Log Activity
  await db.activityLog.create({
    data: {
      userId,
      type: "APPLICATION_SUBMITTED",
      title: `Applied to ${job.title} at ${job.company}`,
      detail: `Submitted application using resume ${resume.title}`,
    },
  });

  return application;
}

export async function getCandidateApplications(userId: string) {
  const applications = await db.jobApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      job: true,
      resume: true,
    },
  });

  // Calculate status counts
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === ApplicationState.APPLIED).length,
    underReview: applications.filter((a) => a.status === ApplicationState.UNDER_REVIEW).length,
    shortlisted: applications.filter((a) => a.status === ApplicationState.SHORTLISTED).length,
    interview: applications.filter((a) => a.status === ApplicationState.INTERVIEW).length,
    offered: applications.filter((a) => a.status === ApplicationState.OFFERED).length,
    rejected: applications.filter((a) => a.status === ApplicationState.REJECTED).length,
    withdrawn: applications.filter((a) => a.status === ApplicationState.WITHDRAWN).length,
  };

  return {
    stats,
    applications: applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      company: app.job.company,
      companyLogo: app.job.companyLogo,
      location: app.job.location,
      salary: app.job.salary,
      workMode: app.job.workMode,
      status: app.status,
      resumeTitle: app.resume?.title || "Default Resume",
      appliedAt: app.createdAt.toISOString(),
      coverNote: app.coverNote,
    })),
  };
}

export async function getApplicationDetails(userId: string, applicationId: string) {
  const app = await db.jobApplication.findFirst({
    where: { id: applicationId, userId },
    include: {
      job: true,
      resume: true,
    },
  });

  if (!app) return null;

  let timeline = [];
  try {
    timeline = JSON.parse(app.timelineJson);
  } catch {
    timeline = [
      {
        status: app.status,
        title: "Application Submitted",
        timestamp: app.createdAt.toISOString(),
      },
    ];
  }

  return {
    id: app.id,
    status: app.status,
    appliedAt: app.createdAt.toISOString(),
    coverNote: app.coverNote,
    job: app.job,
    resume: app.resume,
    timeline,
  };
}

export async function withdrawApplication(userId: string, applicationId: string) {
  const existing = await db.jobApplication.findFirst({
    where: { id: applicationId, userId },
    include: { job: true },
  });

  if (!existing) {
    throw new Error("Application not found or unauthorized.");
  }

  if (existing.status === ApplicationState.WITHDRAWN) {
    throw new Error("Application is already withdrawn.");
  }

  let timeline = [];
  try {
    timeline = JSON.parse(existing.timelineJson);
  } catch {
    timeline = [];
  }

  timeline.push({
    status: ApplicationState.WITHDRAWN,
    title: "Application Withdrawn",
    timestamp: new Date().toISOString(),
    note: "Application withdrawn by candidate.",
  });

  const updated = await db.jobApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationState.WITHDRAWN,
      timelineJson: JSON.stringify(timeline),
    },
  });

  await db.activityLog.create({
    data: {
      userId,
      type: "APPLICATION_WITHDRAWN",
      title: `Withdrew application for ${existing.job.title}`,
      detail: `Application ID ${applicationId} set to WITHDRAWN`,
    },
  });

  return updated;
}
