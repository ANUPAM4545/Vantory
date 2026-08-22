import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getCandidateApplications } from "@/lib/jobs/jobs-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const data = await getCandidateApplications(user.id);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
