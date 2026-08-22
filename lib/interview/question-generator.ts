import {
  CandidateIntelligenceProfile,
  DifficultyLevel,
  InterviewerStyle,
  InterviewType,
} from "./types";
import { defaultAIProvider } from "./ai-provider";

export class QuestionGenerator {
  private static categories: string[] = [
    "Introduction & Role Fit",
    "Technical Fundamentals",
    "Project & Resume Probing",
    "System Design & Scaling",
    "Behavioral & Leadership",
  ];

  public static selectNextCategory(params: {
    questionIndex: number;
    interviewType: InterviewType;
    coveredTopics: string[];
    weakTopics: string[];
  }): string {
    const { questionIndex, interviewType, weakTopics } = params;

    if (questionIndex === 0) return "Introduction & Role Fit";

    if (interviewType === "TECHNICAL") {
      return (questionIndex % 2 === 1) ? "Technical Fundamentals" : "System Design & Scaling";
    }

    if (interviewType === "BEHAVIORAL") {
      return "Behavioral & Leadership";
    }

    if (interviewType === "RESUME_BASED") {
      return "Project & Resume Probing";
    }

    if (interviewType === "JOB_SPECIFIC") {
      return "Technical Fundamentals";
    }

    // Adaptively prioritize weak topics if candidate struggled earlier
    if (weakTopics.length > 0 && questionIndex % 3 === 0) {
      return "Technical Fundamentals";
    }

    // Default Full Interview sequence rotation
    const categoryIdx = (questionIndex - 1) % (this.categories.length - 1) + 1;
    return this.categories[categoryIdx] || "Technical Fundamentals";
  }

  public static async generateNextQuestion(params: {
    profile: CandidateIntelligenceProfile;
    interviewType: InterviewType;
    difficulty: DifficultyLevel;
    interviewerStyle: InterviewerStyle;
    questionIndex: number;
    previousQuestions: string[];
    previousAnswers: string[];
    weakTopics: string[];
    coveredTopics: string[];
  }): Promise<{ questionText: string; category: string }> {
    const category = this.selectNextCategory({
      questionIndex: params.questionIndex,
      interviewType: params.interviewType,
      coveredTopics: params.coveredTopics,
      weakTopics: params.weakTopics,
    });

    return await defaultAIProvider.generateQuestion({
      profile: params.profile,
      interviewType: params.interviewType,
      difficulty: params.difficulty,
      interviewerStyle: params.interviewerStyle,
      category,
      questionIndex: params.questionIndex,
      previousQuestions: params.previousQuestions,
      previousAnswers: params.previousAnswers,
    });
  }
}
