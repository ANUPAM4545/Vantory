import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getCandidateResumes, saveCandidateResume } from "@/lib/resume/resume-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const resumes = await getCandidateResumes(user.id);
    return NextResponse.json({ success: true, resumes });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load resumes.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const saved = await saveCandidateResume(user.id, body);

    return NextResponse.json({ success: true, resume: saved });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to save resume.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
