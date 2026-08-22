import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getCompanyDashboardStats } from "@/lib/company/company-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Company Admin role required." }, { status: 403 });
    }

    const stats = await getCompanyDashboardStats(user.id);
    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
