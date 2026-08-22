import { NextRequest, NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { getInstituteStudentDetail } from "@/lib/institute/institute-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireInstituteAdmin();
    const { id } = await params;

    const student = await getInstituteStudentDetail(admin.id, id);
    return NextResponse.json({ success: true, student });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized")
      ? 401
      : msg.includes("Forbidden") || msg.includes("belongs to another")
      ? 403
      : msg.includes("not found")
      ? 404
      : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
