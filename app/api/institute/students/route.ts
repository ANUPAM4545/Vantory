import { NextRequest, NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { getInstituteStudents } from "@/lib/institute/institute-service";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireInstituteAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const department = searchParams.get("department") || undefined;
    const course = searchParams.get("course") || undefined;
    const gradYear = searchParams.get("graduationYear");
    const graduationYear = gradYear ? parseInt(gradYear, 10) : undefined;
    const readinessStatus = (searchParams.get("readinessStatus") as "ALL" | "READY" | "NEEDS_IMPROVEMENT" | "NOT_READY") || undefined;
    const placementStatus = searchParams.get("placementStatus") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const result = await getInstituteStudents(admin.id, {
      search,
      department,
      course,
      graduationYear,
      readinessStatus,
      placementStatus,
      page,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
