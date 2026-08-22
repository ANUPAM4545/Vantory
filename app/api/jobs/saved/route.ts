import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getSavedJobs } from "@/lib/jobs/jobs-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const savedJobs = await getSavedJobs(user.id);

    return NextResponse.json({
      success: true,
      savedJobs,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
