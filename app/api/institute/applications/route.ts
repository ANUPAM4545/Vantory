import { NextRequest, NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { getInstituteApplications } from "@/lib/institute/institute-service";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireInstituteAdmin();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const applications = await getInstituteApplications(admin.id, {
      status: statusFilter,
      search,
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
