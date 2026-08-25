import { NextRequest, NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { getInstituteJobDetails } from "@/lib/institute/institute-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireInstituteAdmin();
    const { id: jobId } = await params;
    const data = await getInstituteJobDetails(admin.id, jobId);
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized")
      ? 401
      : msg.includes("Forbidden")
      ? 403
      : msg.includes("not found")
      ? 404
      : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
