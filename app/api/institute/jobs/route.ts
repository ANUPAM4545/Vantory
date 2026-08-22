import { NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { getInstituteJobs } from "@/lib/institute/institute-service";

export async function GET() {
  try {
    const admin = await requireInstituteAdmin();
    const jobs = await getInstituteJobs(admin.id);
    return NextResponse.json({ success: true, jobs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
