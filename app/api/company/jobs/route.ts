import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getCompanyJobs, createCompanyJob } from "@/lib/company/company-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Company Admin role required." }, { status: 403 });
    }

    const jobs = await getCompanyJobs(user.id);
    return NextResponse.json({ success: true, jobs });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Company Admin role required." }, { status: 403 });
    }

    const body = await request.json();
    const newJob = await createCompanyJob(user.id, body);
    return NextResponse.json({ success: true, job: newJob });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create job posting.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
