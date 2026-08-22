import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { applyToJob } from "@/lib/jobs/jobs-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const body = await request.json();
    const { resumeId, coverNote } = body;

    if (!resumeId || typeof resumeId !== "string") {
      return NextResponse.json(
        { success: false, error: "Please select a SkillAssociate Resume to apply." },
        { status: 400 }
      );
    }

    const application = await applyToJob(user.id, jobId, resumeId, coverNote);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      status: application.status,
      message: "Application submitted successfully!",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
