import { NextRequest, NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { importInstituteStudentsCsv } from "@/lib/institute/institute-service";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireInstituteAdmin();
    const body = await req.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];

    const result = await importInstituteStudentsCsv(admin.id, rows);
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
