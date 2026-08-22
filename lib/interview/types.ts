export type InterviewType = "FULL" | "TECHNICAL" | "BEHAVIORAL" | "RESUME_BASED" | "JOB_SPECIFIC";
export type DifficultyLevel = "Easy" | "Medium" | "Hard" | "Expert";
export type CandidateProficiency = "Beginner" | "Developing" | "Competent" | "Strong" | "Expert";
export type InterviewerStyle = "Professional" | "Friendly" | "Strict" | "FAANG-style" | "Startup-style";
export type InterviewState =
  | "CREATED"
  | "ACTIVE"
  | "AI_ASKING"
  | "WAITING_FOR_CANDIDATE"
  | "ANSWER_RECEIVED"
  | "EVALUATING"
  | "FOLLOW_UP_REQUIRED"
  | "NEXT_QUESTION"
  | "FINALIZING"
  | "COMPLETED"
  | "ABANDONED";

export interface CandidateIntelligenceProfile {
  resumeId?: string;
  targetJobTitle: string;
  companyName?: string;
  jobDescription: string;
  requiredSkills: string[];
  preferredSkills: string[];
  extractedExperience: string[];
  extractedProjects: Array<{
    title: string;
    description?: string;
    techStack?: string[];
  }>;
  resumeEvidenceSnippets: string[];
  weakAreas: string[];
  strongAreas: string[];
}

export interface InterviewSetupConfig {
  resumeId?: string;
  targetJobTitle: string;
  companyName?: string;
  jobDescription: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  interviewerStyle: InterviewerStyle;
}

export interface QuestionEvaluation {
  technicalAccuracy: number; // 0-100
  relevance: number;        // 0-100
  depth: number;            // 0-100
  completeness: number;     // 0-100
  evidenceScore: number;    // 0-100
  communication: number;    // 0-100
  problemSolving?: number;  // 0-100
  starEvaluation?: {
    situation: "Strong" | "Moderate" | "Weak" | "Missing";
    task: "Strong" | "Moderate" | "Weak" | "Missing";
    action: "Strong" | "Moderate" | "Weak" | "Missing";
    result: "Strong" | "Moderate" | "Weak" | "Missing";
  };
  overallScore: number;
  feedback: string;
  strengths: string[];
  missingElements: string[];
  improvementSuggestions: string[];
  exampleAnswerStructure: string;
  credibilityConcern: boolean;
  credibilityReason?: string;
}

export interface EvaluatedQuestion {
  id: string;
  sessionId: string;
  questionIndex: number;
  category: string;
  questionText: string;
  candidateAnswerText?: string;
  audioDurationSeconds?: number;
  evaluation?: QuestionEvaluation;
  isFollowUp: boolean;
  followUpParentId?: string;
}

export interface DomainProficiencyMap {
  [domain: string]: CandidateProficiency;
}

export interface InterviewSessionState {
  sessionId: string;
  status: InterviewState;
  currentDifficulty: DifficultyLevel;
  globalProficiency: CandidateProficiency;
  domainProficiency: DomainProficiencyMap;
  currentQuestionIndex: number;
  totalQuestionsTarget: number;
  elapsedSeconds: number;
  questionsAskedCount: number;
  followUpCount: number;
  coveredTopics: string[];
  weakTopics: string[];
  strongTopics: string[];
}

export interface CategoryScoreBreakdown {
  technicalScore: number;
  communicationScore: number;
  roleAlignmentScore: number;
  projectKnowledgeScore: number;
  behavioralScore: number;
  problemSolvingScore: number;
}

export interface PreparationPlanDay {
  day: number;
  topic: string;
  whyItMatters: string;
  whatToRevise: string[];
  suggestedPractice: string;
  targetOutcome: string;
}

export interface FinalInterviewReport {
  sessionId: string;
  targetJobTitle: string;
  companyName?: string;
  overallScore: number;
  readinessScore: number;
  readinessLevel: "Excellent" | "Strong" | "Developing" | "Needs Preparation" | "Significant Preparation Needed";
  categoryBreakdown: CategoryScoreBreakdown;
  roleReadinessBreakdown: Record<string, number>;
  strongestAreas: string[];
  areasToImprove: string[];
  questionReviews: Array<{
    questionIndex: number;
    category: string;
    questionText: string;
    candidateAnswerText: string;
    score: number;
    evaluation: QuestionEvaluation;
    requirementReference?: string;
  }>;
  preparationPlan: PreparationPlanDay[];
  historyProgression: {
    previousAverage: number;
    currentAverage: number;
    improvement: number;
  };
}
