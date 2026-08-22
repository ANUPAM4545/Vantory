import {
  CandidateIntelligenceProfile,
  DifficultyLevel,
  InterviewerStyle,
  QuestionEvaluation,
} from "./types";
import { defaultAIProvider } from "./ai-provider";

export class AnswerEvaluator {
  public static async evaluateCandidateAnswer(params: {
    questionText: string;
    category: string;
    candidateAnswerText: string;
    profile: CandidateIntelligenceProfile;
    difficulty: DifficultyLevel;
    interviewerStyle: InterviewerStyle;
  }): Promise<QuestionEvaluation> {
    return await defaultAIProvider.evaluateAnswer({
      questionText: params.questionText,
      category: params.category,
      candidateAnswerText: params.candidateAnswerText,
      profile: params.profile,
      difficulty: params.difficulty,
      interviewerStyle: params.interviewerStyle,
    });
  }
}
