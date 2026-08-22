import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      resumeId,
      uploadedResumeText,
      uploadedFileName,
      jobId,
      targetJobTitle,
      companyName,
      jobDescription,
      interviewType = "FULL",
      difficulty = "Medium",
      interviewerStyle = "Professional",
      durationMinutes = 20,
    } = body;

    if (!targetJobTitle || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Target Job Title and Job Description are required." },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionData: any = {
      userId: user.id,
      targetJobTitle,
      jobRole: targetJobTitle,
      companyName: companyName || null,
      jobDescription,
      interviewType,
      difficulty,
      interviewerStyle,
      durationMinutes: Number(durationMinutes) || 20,
      status: "CREATED",
      currentDifficulty: difficulty,
      currentQuestionIndex: 0,
      sessionStateJson: JSON.stringify({
        uploadedResumeText: uploadedResumeText || null,
        uploadedFileName: uploadedFileName || null,
        coveredTopics: [],
        weakTopics: [],
        strongTopics: [],
      }),
    };

    if (resumeId && typeof resumeId === "string" && resumeId.trim()) {
      sessionData.resumeId = resumeId;
    }
    if (jobId && typeof jobId === "string" && jobId.trim()) {
      sessionData.jobId = jobId;
    }

    const session = await db.interviewSession.create({
      data: sessionData,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      session,
    });
  } catch (err: unknown) {
    console.error("Create Interview Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to setup interview session." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const sessions = await db.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        targetJobTitle: true,
        companyName: true,
        interviewType: true,
        difficulty: true,
        durationMinutes: true,
        status: true,
        overallScore: true,
        readinessScore: true,
        readinessLevel: true,
        createdAt: true,
      },
    });

    const completed = sessions.filter((s) => s.status === "COMPLETED" && s.overallScore != null);
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completed.length)
      : 0;

    return NextResponse.json({
      success: true,
      sessions,
      stats: {
        totalInterviews: sessions.length,
        completedCount: completed.length,
        averageScore: avgScore,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch interview history." },
      { status: 500 }
    );
  }
}
