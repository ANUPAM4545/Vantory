import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { InterviewEngine } from "@/lib/interview/interview-engine";
import { EvaluatedQuestion, CandidateIntelligenceProfile } from "@/lib/interview/types";

export async function GET(
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
      include: { questions: { orderBy: { questionIndex: "asc" } } },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Interview session not found." }, { status: 404 });
    }

    if (session.reportSnapshotJson) {
      try {
        const report = JSON.parse(session.reportSnapshotJson);
        return NextResponse.json({ success: true, report });
      } catch {
        // Fallback construct below
      }
    }

    let sessionData: Record<string, unknown> = {};
    try {
      sessionData = JSON.parse(session.sessionStateJson || "{}");
    } catch {
      // Fallback
    }

    const profile: CandidateIntelligenceProfile = (sessionData.profile as CandidateIntelligenceProfile) || {
      targetJobTitle: session.targetJobTitle,
      companyName: session.companyName || undefined,
      jobDescription: session.jobDescription,
      requiredSkills: ["Software Engineering"],
      preferredSkills: [],
      extractedExperience: [],
      extractedProjects: [],
      resumeEvidenceSnippets: [],
      weakAreas: [],
      strongAreas: [],
    };

    const allEvaluatedQuestions: EvaluatedQuestion[] = session.questions.map((q) => ({
      id: q.id,
      sessionId: q.sessionId,
      questionIndex: q.questionIndex,
      category: q.category,
      questionText: q.questionText,
      candidateAnswerText: q.candidateAnswerText || undefined,
      audioDurationSeconds: q.audioDurationSeconds || undefined,
      evaluation: q.evaluationJson ? JSON.parse(q.evaluationJson) : undefined,
      isFollowUp: q.isFollowUp,
      followUpParentId: q.followUpParentId || undefined,
    }));

    const report = InterviewEngine.finalizeReport({
      sessionId: session.id,
      profile,
      allEvaluatedQuestions,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch interview report." },
      { status: 500 }
    );
  }
}
