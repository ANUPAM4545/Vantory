import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { InterviewEngine } from "@/lib/interview/interview-engine";
import { EvaluatedQuestion, InterviewSessionState, InterviewSetupConfig, CandidateIntelligenceProfile, DifficultyLevel, InterviewType, InterviewerStyle } from "@/lib/interview/types";

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
    const body = await request.json();
    const { questionId, candidateAnswerText, audioDurationSeconds } = body;

    if (!candidateAnswerText || typeof candidateAnswerText !== "string" || !candidateAnswerText.trim()) {
      return NextResponse.json(
        { success: false, error: "Candidate answer text is required." },
        { status: 400 }
      );
    }

    const session = await db.interviewSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: { questions: { orderBy: { questionIndex: "asc" } } },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Interview session not found." }, { status: 404 });
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json({ success: false, error: "Interview session is already completed." }, { status: 400 });
    }

    const targetQuestion = session.questions.find((q) => q.id === questionId) || session.questions[session.questions.length - 1];

    if (!targetQuestion) {
      return NextResponse.json({ success: false, error: "Active question not found." }, { status: 404 });
    }

    // Parse stored session state
    let sessionData: Record<string, unknown> = {};
    try {
      sessionData = JSON.parse(session.sessionStateJson || "{}");
    } catch {
      // Fallback
    }

    const state: InterviewSessionState = (sessionData.state as InterviewSessionState) || {
      sessionId: session.id,
      status: "ACTIVE",
      currentDifficulty: session.currentDifficulty as DifficultyLevel,
      globalProficiency: "Competent",
      domainProficiency: {},
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestionsTarget: InterviewEngine.calculateQuestionTarget(session.durationMinutes),
      elapsedSeconds: 0,
      questionsAskedCount: session.questions.length,
      followUpCount: 0,
      coveredTopics: [],
      weakTopics: [],
      strongTopics: [],
    };

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

    const currentQuestionObj: EvaluatedQuestion = {
      id: targetQuestion.id,
      sessionId: session.id,
      questionIndex: targetQuestion.questionIndex,
      category: targetQuestion.category,
      questionText: targetQuestion.questionText,
      isFollowUp: targetQuestion.isFollowUp,
      followUpParentId: targetQuestion.followUpParentId || undefined,
    };

    const allPreviousEvaluated: EvaluatedQuestion[] = session.questions.map((q) => ({
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

    const result = await InterviewEngine.processCandidateAnswer({
      sessionId: session.id,
      config,
      profile,
      state,
      currentQuestion: currentQuestionObj,
      candidateAnswerText,
      audioDurationSeconds: audioDurationSeconds || undefined,
      allPreviousQuestions: allPreviousEvaluated,
    });

    // Save evaluation & answer to DB
    await db.mockInterviewQuestion.update({
      where: { id: targetQuestion.id },
      data: {
        candidateAnswerText,
        audioDurationSeconds: audioDurationSeconds || null,
        evaluationJson: JSON.stringify(result.evaluatedQuestion.evaluation),
        credibilityConcern: result.evaluatedQuestion.evaluation?.credibilityConcern || false,
        credibilityReason: result.evaluatedQuestion.evaluation?.credibilityReason || null,
      },
    });

    let createdNextQuestion = null;

    if (!result.isInterviewComplete && result.nextQuestion) {
      createdNextQuestion = await db.mockInterviewQuestion.create({
        data: {
          sessionId: session.id,
          questionIndex: result.updatedState.currentQuestionIndex,
          category: result.nextQuestion.category,
          questionText: result.nextQuestion.questionText,
          isFollowUp: result.nextQuestion.isFollowUp,
          followUpParentId: result.nextQuestion.parentId || null,
        },
      });
    }

    // Update Session State in DB
    await db.interviewSession.update({
      where: { id: session.id },
      data: {
        status: result.isInterviewComplete ? "COMPLETED" : "ACTIVE",
        currentDifficulty: result.updatedState.currentDifficulty,
        currentQuestionIndex: result.updatedState.currentQuestionIndex,
        sessionStateJson: JSON.stringify({
          state: result.updatedState,
          profile,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      evaluatedQuestion: result.evaluatedQuestion,
      nextQuestion: createdNextQuestion
        ? {
            id: createdNextQuestion.id,
            questionIndex: createdNextQuestion.questionIndex,
            category: createdNextQuestion.category,
            questionText: createdNextQuestion.questionText,
            isFollowUp: createdNextQuestion.isFollowUp,
          }
        : null,
      isInterviewComplete: result.isInterviewComplete,
    });
  } catch (err: unknown) {
    console.error("Process Answer Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to process candidate answer." },
      { status: 500 }
    );
  }
}
