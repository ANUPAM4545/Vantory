import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { InterviewEngine } from "@/lib/interview/interview-engine";
import { InterviewSetupConfig, InterviewType, DifficultyLevel, InterviewerStyle } from "@/lib/interview/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    const session = await db.interviewSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: { resume: true },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Interview session not found." }, { status: 404 });
    }

    // Reuse existing ATS scan report snapshot for target role if available
    let atsSnapshotJson: string | undefined;
    if (session.resumeId) {
      const atsScan = await db.atsScan.findFirst({
        where: { userId: user.id, resumeId: session.resumeId },
        orderBy: { createdAt: "desc" },
      });
      if (atsScan) {
        atsSnapshotJson = atsScan.reportSnapshotJson;
      }
    }

    const config: InterviewSetupConfig = {
      resumeId: session.resumeId || undefined,
      targetJobTitle: session.targetJobTitle,
      companyName: session.companyName || undefined,
      jobDescription: session.jobDescription,
      interviewType: session.interviewType as InterviewType,
      difficulty: session.difficulty as DifficultyLevel,
      durationMinutes: session.durationMinutes,
      interviewerStyle: session.interviewerStyle as InterviewerStyle,
    };

    let resumeContentStr = session.resume?.contentJson;
    try {
      const stateObj = JSON.parse(session.sessionStateJson || "{}");
      if (stateObj.uploadedResumeText) {
        resumeContentStr = stateObj.uploadedResumeText;
      }
    } catch {
      // Fallback
    }

    const { state, profile, openingQuestion } = await InterviewEngine.initializeSession(
      session.id,
      config,
      resumeContentStr,
      atsSnapshotJson
    );

    // Save opening question in database
    const createdQuestion = await db.mockInterviewQuestion.create({
      data: {
        sessionId: session.id,
        questionIndex: 1,
        category: openingQuestion.category,
        questionText: openingQuestion.questionText,
      },
    });

    // Update session status to ACTIVE
    await db.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "ACTIVE",
        currentQuestionIndex: 1,
        currentDifficulty: state.currentDifficulty,
        sessionStateJson: JSON.stringify({
          ...state,
          profile,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      state,
      currentQuestion: {
        id: createdQuestion.id,
        questionIndex: 1,
        category: createdQuestion.category,
        questionText: createdQuestion.questionText,
      },
    });
  } catch (err: unknown) {
    console.error("Start Interview Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to start interview." },
      { status: 500 }
    );
  }
}
