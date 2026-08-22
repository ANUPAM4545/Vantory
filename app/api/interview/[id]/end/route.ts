import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { InterviewEngine } from "@/lib/interview/interview-engine";
import { EvaluatedQuestion, CandidateIntelligenceProfile } from "@/lib/interview/types";

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
      include: { questions: { orderBy: { questionIndex: "asc" } } },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Interview session not found." }, { status: 404 });
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
      requiredSkills: ["Software Engineering", "System Design"],
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

    // Fetch previous average for progress tracking comparison
    const pastSessions = await db.interviewSession.findMany({
      where: { userId: user.id, status: "COMPLETED", id: { not: session.id } },
      select: { overallScore: true },
    });

    const previousAverage = pastSessions.length > 0
      ? Math.round(pastSessions.reduce((sum, s) => sum + (s.overallScore || 70), 0) / pastSessions.length)
      : 74;

    const finalReport = InterviewEngine.finalizeReport({
      sessionId: session.id,
      profile,
      allEvaluatedQuestions,
      previousAverage,
    });

    // Update Session with Finalized Scores and Report Snapshots
    await db.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        overallScore: finalReport.overallScore,
        technicalScore: finalReport.categoryBreakdown.technicalScore,
        communicationScore: finalReport.categoryBreakdown.communicationScore,
        roleAlignmentScore: finalReport.categoryBreakdown.roleAlignmentScore,
        projectKnowledgeScore: finalReport.categoryBreakdown.projectKnowledgeScore,
        behavioralScore: finalReport.categoryBreakdown.behavioralScore,
        readinessScore: finalReport.readinessScore,
        readinessLevel: finalReport.readinessLevel,
        reportSnapshotJson: JSON.stringify(finalReport),
        prepPlanJson: JSON.stringify(finalReport.preparationPlan),
      },
    });

    return NextResponse.json({
      success: true,
      report: finalReport,
    });
  } catch (err: unknown) {
    console.error("End Interview Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to end interview session." },
      { status: 500 }
    );
  }
}
