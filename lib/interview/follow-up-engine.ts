import { CandidateIntelligenceProfile, QuestionEvaluation } from "./types";
import { defaultAIProvider } from "./ai-provider";

export class FollowUpEngine {
  public static shouldTriggerFollowUp(params: {
    candidateAnswerText: string;
    evaluation: QuestionEvaluation;
    followUpCount: number;
    maxFollowUpsAllowed?: number;
  }): boolean {
    const { candidateAnswerText, evaluation, followUpCount, maxFollowUpsAllowed = 3 } = params;

    if (followUpCount >= maxFollowUpsAllowed) return false;

    // Trigger follow-up if answer is brief or lacks depth
    if (candidateAnswerText.trim().length < 60) return true;
    if (evaluation.depth < 70) return true;
    if (evaluation.completeness < 65) return true;
    if (evaluation.credibilityConcern) return true;

    return false;
  }

  public static async generateFollowUpQuestion(params: {
    questionText: string;
    category: string;
    candidateAnswerText: string;
    evaluation: QuestionEvaluation;
    profile: CandidateIntelligenceProfile;
  }): Promise<{ questionText: string; category: string }> {
    const aiFollowUp = await defaultAIProvider.generateFollowUp({
      questionText: params.questionText,
      candidateAnswerText: params.candidateAnswerText,
      evaluation: params.evaluation,
      profile: params.profile,
      interviewerStyle: "Professional",
    });

    if (aiFollowUp) {
      return aiFollowUp;
    }

    // Default follow-up probing template
    return {
      questionText: `That's a helpful overview. Could you elaborate specifically on the underlying architecture, edge cases, and performance metrics for that solution?`,
      category: `${params.category} (Follow-Up)`,
    };
  }
}
