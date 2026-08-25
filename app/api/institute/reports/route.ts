import { NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import { generateInstituteReports } from "@/lib/institute/institute-service";

export async function GET(request: Request) {
  try {
    const admin = await requireInstituteAdmin();
    const { searchParams } = new URL(request.url);
    const reportType = (searchParams.get("type") as "readiness" | "department" | "placement" | "applications" | "skills") || "readiness";

    const report = await generateInstituteReports(admin.id, reportType);

    if (searchParams.get("format") === "csv") {
      return new Response(report.csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${report.instituteName.replace(/\s+/g, "_")}_${reportType}_Report.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
