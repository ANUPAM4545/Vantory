import { NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { seedInstituteDemoApplications } from "@/lib/institute/institute-service";

export async function POST() {
  try {
    const admin = await requireInstituteAdmin();
    const result = await seedInstituteDemoApplications(admin.id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
