import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import {
  getCompanyProfile,
  getCompanyDashboardStats,
  getCompanyJobs,
  getCompanyApplications,
} from "@/lib/company/company-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 403 });
    }

    const [profile, stats, jobs, applications] = await Promise.all([
      getCompanyProfile(user.id),
      getCompanyDashboardStats(user.id),
      getCompanyJobs(user.id),
      getCompanyApplications(user.id),
    ]);

    return NextResponse.json({
      success: true,
      profile,
      stats,
      jobs,
      applications,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
