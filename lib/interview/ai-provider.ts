import {
  CandidateIntelligenceProfile,
  DifficultyLevel,
  InterviewerStyle,
  InterviewType,
  QuestionEvaluation,
} from "./types";

export interface AIProvider {
  generateQuestion(params: {
    profile: CandidateIntelligenceProfile;
    interviewType: InterviewType;
    difficulty: DifficultyLevel;
    interviewerStyle: InterviewerStyle;
    category: string;
    questionIndex: number;
    previousQuestions: string[];
    previousAnswers: string[];
    isFollowUp?: boolean;
    parentQuestionText?: string;
    parentAnswerText?: string;
  }): Promise<{ questionText: string; category: string }>;

  evaluateAnswer(params: {
    questionText: string;
    category: string;
    candidateAnswerText: string;
    profile: CandidateIntelligenceProfile;
    difficulty: DifficultyLevel;
    interviewerStyle: InterviewerStyle;
  }): Promise<QuestionEvaluation>;

  generateFollowUp(params: {
    questionText: string;
    candidateAnswerText: string;
    evaluation: QuestionEvaluation;
    profile: CandidateIntelligenceProfile;
    interviewerStyle: InterviewerStyle;
  }): Promise<{ questionText: string; category: string } | null>;
}

class HeuristicAIProvider implements AIProvider {
  async generateQuestion(params: {
    profile: CandidateIntelligenceProfile;
    interviewType: InterviewType;
    difficulty: DifficultyLevel;
    interviewerStyle: InterviewerStyle;
    category: string;
    questionIndex: number;
    previousQuestions: string[];
    previousAnswers: string[];
    isFollowUp?: boolean;
    parentQuestionText?: string;
    parentAnswerText?: string;
  }): Promise<{ questionText: string; category: string }> {
    const { profile, category, difficulty, isFollowUp, parentQuestionText, parentAnswerText } = params;
    const requiredSkills = profile.requiredSkills.length > 0 ? profile.requiredSkills : ["Software Architecture", "API Design", "Databases"];
    const project = profile.extractedProjects[0] || { title: "Production Application", techStack: requiredSkills };

    if (isFollowUp && parentQuestionText && parentAnswerText) {
      if (parentAnswerText.length < 50) {
        return {
          questionText: `That's a helpful starting point. Could you walk me through the specific technical decisions and trade-offs you made in that scenario?`,
          category: category || "Technical Deep Dive",
        };
      }
      return {
        questionText: `You mentioned caching and performance. How did you handle cache invalidation and database consistency when scaling that system under high request volume?`,
        category: category || "System Architecture",
      };
    }

    switch (category) {
      case "Introduction & Role Fit":
        return {
          questionText: `Welcome to the interview for the ${profile.targetJobTitle} position${profile.companyName ? ` at ${profile.companyName}` : ""}. To start, could you briefly introduce yourself and highlight how your experience aligns with this role?`,
          category: "Introduction & Role Fit",
        };

      case "Technical Fundamentals":
        return {
          questionText: `For a ${difficulty}-level ${profile.targetJobTitle} position requiring ${requiredSkills[0] || "Python"}, how do you manage asynchronous concurrency, connection pooling, and error boundaries in high-throughput APIs?`,
          category: "Technical Fundamentals",
        };

      case "Project & Resume Probing":
        return {
          questionText: `In your resume, you highlighted your work on ${project.title}. Could you walk me through the overall architecture, key technical challenges, and the specific role you played in its development?`,
          category: "Project & Resume Probing",
        };

      case "System Design & Scaling":
        return {
          questionText: `If our backend infrastructure experiences a 10x surge in concurrent traffic, how would you architect our microservices, database indexes, and caching strategies to ensure sub-100ms latency?`,
          category: "System Design & Scaling",
        };

      case "Behavioral & Leadership":
        return {
          questionText: `Tell me about a time when you faced a critical production failure or a technical disagreement with a team member. How did you handle the situation, and what was the ultimate outcome?`,
          category: "Behavioral & Leadership",
        };

      default:
        return {
          questionText: `Regarding your experience with ${requiredSkills[params.questionIndex % requiredSkills.length] || "backend development"}, what are the most common pitfalls you encounter, and how do you write automated tests to prevent them?`,
          category: category || "Role-Specific Skills",
        };
    }
  }

  async evaluateAnswer(params: {
    questionText: string;
    category: string;
    candidateAnswerText: string;
    profile: CandidateIntelligenceProfile;
    difficulty: DifficultyLevel;
  }): Promise<QuestionEvaluation> {
    const text = params.candidateAnswerText.trim();
    const wordCount = text.split(/\s+/).length;

    const isDetailed = wordCount >= 15;
    const isVeryDetailed = wordCount >= 40;

    const baseAccuracy = isVeryDetailed ? 88 : isDetailed ? 78 : 62;
    const baseRelevance = isDetailed ? 85 : 68;
    const baseDepth = isVeryDetailed ? 86 : isDetailed ? 72 : 55;
    const baseCompleteness = isVeryDetailed ? 84 : isDetailed ? 70 : 50;
    const baseEvidence = text.toLowerCase().includes("built") || text.toLowerCase().includes("used") || text.toLowerCase().includes("project") ? 85 : 60;
    const baseCommunication = isDetailed ? 84 : 65;

    const overallScore = Math.round((baseAccuracy + baseRelevance + baseDepth + baseCompleteness + baseEvidence + baseCommunication) / 6);

    const isBehavioral = params.category.includes("Behavioral");

    return {
      technicalAccuracy: baseAccuracy,
      relevance: baseRelevance,
      depth: baseDepth,
      completeness: baseCompleteness,
      evidenceScore: baseEvidence,
      communication: baseCommunication,
      problemSolving: Math.round((baseDepth + baseAccuracy) / 2),
      starEvaluation: isBehavioral
        ? {
            situation: isDetailed ? "Strong" : "Moderate",
            task: isDetailed ? "Strong" : "Weak",
            action: isVeryDetailed ? "Strong" : "Moderate",
            result: isVeryDetailed ? "Strong" : "Missing",
          }
        : undefined,
      overallScore,
      feedback: isDetailed
        ? "Clear and structured response demonstrating practical knowledge of core engineering concepts."
        : "Answer provides a good high-level summary but lacks specific technical trade-offs, architecture decisions, and measurable outcomes.",
      strengths: [
        "Relevant to the target role requirements",
        "Clear communication and logical flow",
        text.length > 50 ? "Includes concrete technical context" : "Direct response to the prompt",
      ],
      missingElements: wordCount < 50 ? ["Deep technical trade-off analysis", "Quantifiable impact or metrics", "Error handling / edge cases"] : ["Explicit mention of automated test strategies"],
      improvementSuggestions: [
        "Structure behavioral answers using the STAR format (Situation, Task, Action, Result).",
        "Quantify project outcomes with concrete metrics (e.g. reduced latency by 35%).",
        "Explain WHY specific technologies or architectural patterns were chosen over alternatives.",
      ],
      exampleAnswerStructure:
        "A strong response should cover: 1. The core problem/requirement, 2. The technical architecture & tools selected, 3. Trade-offs considered, 4. Edge cases & error handling, 5. Quantifiable results achieved.",
      credibilityConcern: false,
    };
  }

  async generateFollowUp(params: {
    questionText: string;
    candidateAnswerText: string;
    evaluation: QuestionEvaluation;
    profile: CandidateIntelligenceProfile;
    interviewerStyle: InterviewerStyle;
    category?: string;
  }): Promise<{ questionText: string; category: string } | null> {
    if (params.evaluation.depth < 75 || params.candidateAnswerText.length < 120) {
      return {
        questionText: `You mentioned your approach, but how did you handle edge cases, database transactions, and failover when scaling that implementation?`,
        category: params.category || "Technical Follow-Up",
      };
    }
    return null;
  }
}

export const defaultAIProvider: AIProvider = new HeuristicAIProvider();
