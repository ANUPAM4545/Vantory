import { db } from "@/lib/db";
import { Prisma, ApplicationState } from "@prisma/client";
import {
  calculateStudentReadiness,
  aggregateInstitutionFunnel,
  type StudentRawMetrics,
} from "./readiness-engine";

export type StudentWithMetricsPayload = Prisma.UserGetPayload<{
  include: {
    profile: true;
    resumes: { select: { id: true } };
    atsScans: { select: { overallScore: true } };
    interviews: { select: { overallScore: true } };
    applications: { select: { status: true } };
  };
}>;

export interface StudentFilterInput {
  search?: string;
  department?: string;
  course?: string;
  graduationYear?: number;
  readinessStatus?: "ALL" | "READY" | "NEEDS_IMPROVEMENT" | "NOT_READY";
  placementStatus?: string;
  page?: number;
  limit?: number;
}

export interface UpdateInstituteProfileInput {
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  establishedYear?: number;
}

/**
 * Helper to ensure Institute record exists for the authenticated INSTITUTE_ADMIN user
 */
export async function getOrCreateInstituteProfile(adminUserId: string) {
  const user = await db.user.findUnique({
    where: { id: adminUserId },
    include: { institute: true },
  });

  if (!user) {
    throw new Error("Institute Administrator user account not found.");
  }

  if (user.role !== "INSTITUTE_ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden. Institute Administrator access required.");
  }

  // If user has no associated Institute record yet, create one
  if (!user.instituteId || !user.institute) {
    const defaultName = user.name
      ? `${user.name}'s Institute`
      : "SkillAssociate Partner Campus";

    const institute = await db.institute.create({
      data: {
        name: defaultName,
        contactPhone: null,
        domain: user.email.split("@")[1] || "campus.edu",
        verificationStatus: "VERIFIED",
        location: "Main Campus",
      },
    });

    // Link user to institute
    await db.user.update({
      where: { id: adminUserId },
      data: { instituteId: institute.id },
    });

    return { user, institute };
  }

  return { user, institute: user.institute };
}

/**
 * Get Institute Profile details
 */
export async function getInstituteProfile(adminUserId: string) {
  const { user, institute } = await getOrCreateInstituteProfile(adminUserId);

  const adminsCount = await db.user.count({
    where: {
      instituteId: institute.id,
      role: { in: ["INSTITUTE_ADMIN", "SUPER_ADMIN"] },
    },
  });

  return {
    id: institute.id,
    name: institute.name,
    logo: institute.logo,
    website: institute.website,
    description: institute.description,
    location: institute.location || "Main Campus",
    contactEmail: institute.contactEmail || user.email,
    contactPhone: institute.contactPhone,
    domain: institute.domain,
    establishedYear: institute.establishedYear || 2010,
    verificationStatus: institute.verificationStatus || "VERIFIED",
    adminsCount,
    createdAt: institute.createdAt.toISOString(),
  };
}

/**
 * Update Institute Profile details
 */
export async function updateInstituteProfile(
  adminUserId: string,
  input: UpdateInstituteProfileInput
) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const updated = await db.institute.update({
    where: { id: institute.id },
    data: {
      name: input.name?.trim() || institute.name,
      logo: input.logo?.trim() ?? institute.logo,
      website: input.website?.trim() ?? institute.website,
      description: input.description?.trim() ?? institute.description,
      location: input.location?.trim() ?? institute.location,
      contactEmail: input.contactEmail?.trim() ?? institute.contactEmail,
      contactPhone: input.contactPhone?.trim() ?? institute.contactPhone,
      establishedYear: input.establishedYear ?? institute.establishedYear,
    },
  });

  await db.activityLog.create({
    data: {
      userId: adminUserId,
      type: "INSTITUTE_PROFILE_UPDATED",
      title: "Updated Institute Profile",
      detail: `Updated profile for ${updated.name}`,
    },
  });

  return updated;
}

/**
 * Helper to gather raw metrics for all students belonging to the institute
 */
async function getRawStudentMetricsForInstitute(instituteId: string) {
  const students = await db.user.findMany({
    where: {
      instituteId,
      role: { in: ["CANDIDATE", "INSTITUTE_STUDENT"] },
    },
    include: {
      profile: true,
      resumes: { select: { id: true } },
      atsScans: { select: { overallScore: true } },
      interviews: { select: { overallScore: true } },
      applications: { select: { status: true } },
    },
  });

  return students.map((s: StudentWithMetricsPayload) => {
    const resumesCount = s.resumes.length;
    const atsScansCount = s.atsScans.length;
    const avgAtsScore =
      atsScansCount > 0
        ? Math.round(
            s.atsScans.reduce((sum, scan) => sum + scan.overallScore, 0) /
              atsScansCount
          )
        : 0;

    const interviewsCount = s.interviews.length;
    const validInterviews = s.interviews.filter((i) => i.overallScore != null);
    const avgInterviewScore =
      validInterviews.length > 0
        ? Math.round(
            validInterviews.reduce(
              (sum, i) => sum + (i.overallScore || 0),
              0
            ) / validInterviews.length
          )
        : 0;

    const isPlaced =
      s.profile?.placementStatus === "PLACED" ||
      s.applications.some(
        (app: { status: ApplicationState }) => app.status === ApplicationState.OFFERED
      );

    const rawMetrics: StudentRawMetrics = {
      profileCompletionScore: s.profile?.completionScore || 20,
      resumesCount,
      atsScansCount,
      averageAtsScore: avgAtsScore,
      interviewsCount,
      averageInterviewScore: avgInterviewScore,
    };

    const readiness = calculateStudentReadiness(rawMetrics);

    return {
      student: s,
      rawMetrics,
      readiness,
      isPlaced,
    };
  });
}

/**
 * Get Institute Dashboard Key Metrics & Placement Readiness Funnel
 */
export async function getInstituteDashboardStats(adminUserId: string) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const studentData = await getRawStudentMetricsForInstitute(institute.id);
  const funnel = aggregateInstitutionFunnel(
    studentData.map((d) => ({ ...d.rawMetrics, isPlaced: d.isPlaced }))
  );

  const studentUserIds = studentData.map((d) => d.student.id);

  let totalApplications = 0;
  let shortlistedCount = 0;
  let interviewsCount = 0;
  let offersCount = 0;

  if (studentUserIds.length > 0) {
    const apps = await db.jobApplication.findMany({
      where: { userId: { in: studentUserIds } },
      select: { status: true },
    });

    totalApplications = apps.length;
    shortlistedCount = apps.filter(
      (a) => a.status === ApplicationState.SHORTLISTED
    ).length;
    interviewsCount = apps.filter(
      (a) => a.status === ApplicationState.INTERVIEW
    ).length;
    offersCount = apps.filter(
      (a) => a.status === ApplicationState.OFFERED
    ).length;
  }

  // Fetch 5 most recent applications from institute students
  const recentApplications =
    studentUserIds.length > 0
      ? await db.jobApplication.findMany({
          where: { userId: { in: studentUserIds } },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: { select: { id: true, name: true, email: true } },
            job: { select: { id: true, title: true, company: true } },
          },
        })
      : [];

  return {
    instituteName: institute.name,
    verificationStatus: institute.verificationStatus || "VERIFIED",
    totalStudents: funnel.totalStudents,
    activeStudents: funnel.totalStudents,
    placementReadyCount: funnel.placementReadyCount,
    totalApplications,
    shortlistedCount,
    interviewsCount,
    offersCount,
    placedCount: funnel.placedCount,
    funnel,
    recentApplications: recentApplications.map((app) => ({
      id: app.id,
      studentName: app.user.name,
      studentEmail: app.user.email,
      companyName: app.job.company,
      jobTitle: app.job.title,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
    })),
  };
}

/**
 * Get Student Roster with server-side search, filtering, and pagination
 */
export async function getInstituteStudents(
  adminUserId: string,
  filters: StudentFilterInput = {}
) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const studentData = await getRawStudentMetricsForInstitute(institute.id);

  let filtered = studentData;

  // Search filter (Name, Email, Student ID, Department, Course)
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter((item) => {
      const s = item.student;
      const p = s.profile;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        p?.studentId?.toLowerCase().includes(q) ||
        p?.department?.toLowerCase().includes(q) ||
        p?.course?.toLowerCase().includes(q)
      );
    });
  }

  // Department filter
  if (filters.department && filters.department !== "ALL") {
    filtered = filtered.filter(
      (item) => item.student.profile?.department === filters.department
    );
  }

  // Course filter
  if (filters.course && filters.course !== "ALL") {
    filtered = filtered.filter(
      (item) => item.student.profile?.course === filters.course
    );
  }

  // Graduation Year filter
  if (filters.graduationYear) {
    filtered = filtered.filter(
      (item) => item.student.profile?.graduationYear === filters.graduationYear
    );
  }

  // Readiness Status filter
  if (filters.readinessStatus && filters.readinessStatus !== "ALL") {
    if (filters.readinessStatus === "READY") {
      filtered = filtered.filter((item) => item.readiness.isPlacementReady);
    } else if (filters.readinessStatus === "NEEDS_IMPROVEMENT") {
      filtered = filtered.filter(
        (item) => item.readiness.readinessCategory === "Needs Improvement"
      );
    } else if (filters.readinessStatus === "NOT_READY") {
      filtered = filtered.filter(
        (item) => item.readiness.readinessCategory === "Not Ready"
      );
    }
  }

  // Placement Status filter
  if (filters.placementStatus && filters.placementStatus !== "ALL") {
    filtered = filtered.filter(
      (item) =>
        (item.student.profile?.placementStatus || "LOOKING") ===
        filters.placementStatus
    );
  }

  const totalCount = filtered.length;
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit) || 1,
    students: paginated.map((item) => {
      const s = item.student;
      const p = s.profile;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        studentId: p?.studentId || null,
        department: p?.department || "Computer Science",
        course: p?.course || "B.Tech",
        graduationYear: p?.graduationYear || 2027,
        profileCompletion: p?.completionScore || 20,
        resumesCount: item.rawMetrics.resumesCount,
        averageAtsScore: item.rawMetrics.averageAtsScore,
        averageInterviewScore: item.rawMetrics.averageInterviewScore,
        placementStatus: p?.placementStatus || "LOOKING",
        readiness: item.readiness,
      };
    }),
  };
}

/**
 * Get Student Detail with server-side multi-tenant ownership check
 */
export async function getInstituteStudentDetail(
  adminUserId: string,
  studentId: string
) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const student = await db.user.findUnique({
    where: { id: studentId },
    include: {
      profile: true,
      resumes: { orderBy: { updatedAt: "desc" } },
      atsScans: { orderBy: { createdAt: "desc" } },
      interviews: { orderBy: { createdAt: "desc" } },
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: { id: true, title: true, company: true, location: true },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student record not found.");
  }

  // Security Check: Enforce institute ownership
  if (student.instituteId !== institute.id) {
    throw new Error("Unauthorized. Student belongs to another institute.");
  }

  const resumesCount = student.resumes.length;
  const atsScansCount = student.atsScans.length;
  const avgAtsScore =
    atsScansCount > 0
      ? Math.round(
          student.atsScans.reduce((sum, s) => sum + s.overallScore, 0) /
            atsScansCount
        )
      : 0;

  const validInterviews = student.interviews.filter((i) => i.overallScore != null);
  const avgInterviewScore =
    validInterviews.length > 0
      ? Math.round(
          validInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
            validInterviews.length
        )
      : 0;

  const rawMetrics: StudentRawMetrics = {
    profileCompletionScore: student.profile?.completionScore || 20,
    resumesCount,
    atsScansCount,
    averageAtsScore: avgAtsScore,
    interviewsCount: student.interviews.length,
    averageInterviewScore: avgInterviewScore,
  };

  const readiness = calculateStudentReadiness(rawMetrics);

  await db.activityLog.create({
    data: {
      userId: adminUserId,
      type: "STUDENT_VIEWED",
      title: `Viewed Student: ${student.name}`,
      detail: `ID ${student.id}`,
    },
  });

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    profile: student.profile
      ? {
          headline: student.profile.headline,
          bio: student.profile.bio,
          phone: student.profile.phone,
          location: student.profile.location,
          avatarUrl: student.profile.avatarUrl,
          skills: student.profile.skills,
          experienceYears: student.profile.experienceYears,
          education: student.profile.education,
          department: student.profile.department || "Computer Science",
          course: student.profile.course || "B.Tech",
          graduationYear: student.profile.graduationYear || 2027,
          studentId: student.profile.studentId || null,
          placementStatus: student.profile.placementStatus || "LOOKING",
          completionScore: student.profile.completionScore,
        }
      : null,
    readiness,
    resumes: student.resumes.map((r) => ({
      id: r.id,
      title: r.title,
      templateId: r.templateId,
      contentJson: r.contentJson,
      updatedAt: r.updatedAt.toISOString(),
    })),
    atsScans: student.atsScans.map((s) => ({
      id: s.id,
      targetJobTitle: s.targetJobTitle,
      companyName: s.companyName,
      overallScore: s.overallScore,
      createdAt: s.createdAt.toISOString(),
    })),
    interviews: student.interviews.map((i) => ({
      id: i.id,
      jobRole: i.targetJobTitle,
      type: i.interviewType,
      totalScore: i.overallScore,
      isCompleted: i.status === "COMPLETED",
      createdAt: i.createdAt.toISOString(),
    })),
    applications: student.applications.map((a) => ({
      id: a.id,
      jobId: a.job.id,
      jobTitle: a.job.title,
      companyName: a.job.company,
      location: a.job.location,
      status: a.status,
      appliedAt: a.createdAt.toISOString(),
    })),
  };
}

/**
 * Get Campus Marketplace Jobs with applicant counts from this institute's students
 */
export async function getInstituteJobs(adminUserId: string) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const jobs = await db.jobPosting.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const instituteStudents = await db.user.findMany({
    where: { instituteId: institute.id },
    select: { id: true },
  });
  const studentUserIds = instituteStudents.map((s) => s.id);

  const applications =
    studentUserIds.length > 0
      ? await db.jobApplication.findMany({
          where: { userId: { in: studentUserIds } },
          select: { jobId: true },
        })
      : [];

  const appCountByJob: Record<string, number> = {};
  for (const app of applications) {
    appCountByJob[app.jobId] = (app.jobId in appCountByJob ? appCountByJob[app.jobId] : 0) + 1;
  }

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo,
    location: job.location,
    workMode: job.workMode,
    type: job.type,
    experience: job.experience,
    salary: job.salary,
    postedAt: job.postedAt.toISOString(),
    instituteApplicantsCount: appCountByJob[job.id] || 0,
  }));
}

/**
 * Get Institution-Wide Applications Tracker
 */
export async function getInstituteApplications(
  adminUserId: string,
  filters: { status?: string; search?: string } = {}
) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const students = await db.user.findMany({
    where: { instituteId: institute.id },
    select: { id: true },
  });
  const studentUserIds = students.map((s) => s.id);

  if (studentUserIds.length === 0) return [];

  const where: Record<string, unknown> = {
    userId: { in: studentUserIds },
  };

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  const apps = await db.jobApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { department: true, course: true } },
        },
      },
      job: {
        select: { id: true, title: true, company: true, location: true },
      },
    },
  });

  let result = apps.map((app) => ({
    id: app.id,
    studentId: app.user.id,
    studentName: app.user.name,
    studentEmail: app.user.email,
    department: app.user.profile?.department || "Computer Science",
    jobTitle: app.job.title,
    companyName: app.job.company,
    location: app.job.location,
    status: app.status,
    appliedAt: app.createdAt.toISOString(),
  }));

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.studentEmail.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q) ||
        a.jobTitle.toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Get Institution Placement & Department Analytics
 */
export async function getInstituteAnalytics(adminUserId: string) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  const studentData = await getRawStudentMetricsForInstitute(institute.id);
  const funnel = aggregateInstitutionFunnel(
    studentData.map((d) => ({ ...d.rawMetrics, isPlaced: d.isPlaced }))
  );

  // Department Breakdowns
  const deptMap: Record<
    string,
    { total: number; ready: number; placed: number }
  > = {};

  const skillCounts: Record<string, number> = {};

  for (const item of studentData) {
    const dept = item.student.profile?.department || "Computer Science";
    if (!(dept in deptMap)) {
      deptMap[dept] = { total: 0, ready: 0, placed: 0 };
    }
    deptMap[dept].total++;
    if (item.readiness.isPlacementReady) deptMap[dept].ready++;
    if (item.isPlaced) deptMap[dept].placed++;

    const rawSkills = item.student.profile?.skills || "";
    if (rawSkills) {
      const skillsArray = rawSkills.split(",").map((s: string) => s.trim());
      for (const s of skillsArray) {
        if (s) skillCounts[s] = (s in skillCounts ? skillCounts[s] : 0) + 1;
      }
    }
  }

  const departmentAnalytics = Object.keys(deptMap).map((dept) => ({
    department: dept,
    totalStudents: deptMap[dept].total,
    placementReadyCount: deptMap[dept].ready,
    placedCount: deptMap[dept].placed,
  }));

  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    funnel,
    departmentAnalytics,
    topSkills,
  };
}

/**
 * Import Students via CSV Roster
 */
export async function importInstituteStudentsCsv(
  adminUserId: string,
  csvRows: Array<{
    name: string;
    email: string;
    studentId?: string;
    department?: string;
    course?: string;
    graduationYear?: number;
  }>
) {
  const { institute } = await getOrCreateInstituteProfile(adminUserId);

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of csvRows) {
    if (!row.email || !row.name) {
      skippedCount++;
      continue;
    }

    const cleanEmail = row.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      // Link existing user to institute if unassigned
      if (!existing.instituteId) {
        await db.user.update({
          where: { id: existing.id },
          data: { instituteId: institute.id },
        });
        importedCount++;
      } else {
        skippedCount++;
      }
    } else {
      // Create new candidate associated with institute
      const newUser = await db.user.create({
        data: {
          email: cleanEmail,
          passwordHash: "$2b$10$e8w...dummy", // Temporary hash
          name: row.name.trim(),
          role: "CANDIDATE",
          instituteId: institute.id,
          profile: {
            create: {
              department: row.department || "Computer Science",
              course: row.course || "B.Tech",
              graduationYear: row.graduationYear || 2027,
              studentId: row.studentId || null,
              completionScore: 30,
            },
          },
        },
      });
      if (newUser) importedCount++;
    }
  }

  await db.activityLog.create({
    data: {
      userId: adminUserId,
      type: "STUDENT_ROSTER_IMPORTED",
      title: "Imported Student Roster",
      detail: `Imported ${importedCount} students (${skippedCount} skipped)`,
    },
  });

  return { importedCount, skippedCount };
}
