import {
  CandidateIntelligenceProfile,
  EvaluatedQuestion,
  FinalInterviewReport,
  PreparationPlanDay,
} from "./types";

export class ReportGenerator {
  public static generateFinalReport(params: {
    sessionId: string;
    profile: CandidateIntelligenceProfile;
    evaluatedQuestions: EvaluatedQuestion[];
    previousAverage?: number;
  }): FinalInterviewReport {
    const { sessionId, profile, evaluatedQuestions, previousAverage = 74 } = params;

    const answeredQuestions = evaluatedQuestions.filter(
      (q) => q.candidateAnswerText && q.evaluation
    );

    if (answeredQuestions.length === 0) {
      return this.generateEmptyReport(sessionId, profile);
    }

    // 1. Category Score Breakdown
    let techSum = 0, techCount = 0;
    let commSum = 0, commCount = 0;
    let alignSum = 0, alignCount = 0;
    let projSum = 0, projCount = 0;
    let behSum = 0, behCount = 0;
    let psSum = 0, psCount = 0;

    answeredQuestions.forEach((q) => {
      const e = q.evaluation!;
      if (q.category.includes("Technical")) {
        techSum += e.technicalAccuracy;
        techCount++;
      }
      if (q.category.includes("Project") || q.category.includes("Resume")) {
        projSum += e.evidenceScore;
        projCount++;
      }
      if (q.category.includes("Behavioral")) {
        behSum += e.overallScore;
        behCount++;
      }
      if (q.category.includes("System") || q.category.includes("Scaling")) {
        psSum += e.problemSolving || e.depth;
        psCount++;
      }
      commSum += e.communication;
      commCount++;
      alignSum += e.relevance;
      alignCount++;
    });

    const technicalScore = techCount > 0 ? Math.round(techSum / techCount) : 82;
    const communicationScore = commCount > 0 ? Math.round(commSum / commCount) : 80;
    const roleAlignmentScore = alignCount > 0 ? Math.round(alignSum / alignCount) : 85;
    const projectKnowledgeScore = projCount > 0 ? Math.round(projSum / projCount) : 84;
    const behavioralScore = behCount > 0 ? Math.round(behSum / behCount) : 78;
    const problemSolvingScore = psCount > 0 ? Math.round(psSum / psCount) : 80;

    const overallScore = Math.round(
      (technicalScore * 0.35 +
        roleAlignmentScore * 0.2 +
        projectKnowledgeScore * 0.15 +
        problemSolvingScore * 0.15 +
        communicationScore * 0.15)
    );

    const readinessScore = overallScore;

    let readinessLevel: FinalInterviewReport["readinessLevel"] = "Developing";
    if (readinessScore >= 90) readinessLevel = "Excellent";
    else if (readinessScore >= 80) readinessLevel = "Strong";
    else if (readinessScore >= 70) readinessLevel = "Developing";
    else if (readinessScore >= 60) readinessLevel = "Needs Preparation";
    else readinessLevel = "Significant Preparation Needed";

    // 2. Role Readiness Breakdown
    const roleReadinessBreakdown: Record<string, number> = {};
    profile.requiredSkills.forEach((skill, idx) => {
      const offset = (idx * 3) % 10;
      roleReadinessBreakdown[skill] = Math.max(60, Math.min(98, overallScore + (offset - 4)));
    });

    // 3. Strengths vs Weaknesses
    const strongestAreas: string[] = [];
    const areasToImprove: string[] = [];

    answeredQuestions.forEach((q) => {
      const e = q.evaluation!;
      if (e.overallScore >= 80) {
        e.strengths.forEach((s) => {
          if (!strongestAreas.includes(s)) strongestAreas.push(s);
        });
      } else {
        e.improvementSuggestions.forEach((s) => {
          if (!areasToImprove.includes(s)) areasToImprove.push(s);
        });
      }
    });

    if (strongestAreas.length === 0) {
      strongestAreas.push("Direct response to interviewer prompts", "Technical clarity", "Project experience");
    }
    if (areasToImprove.length === 0) {
      areasToImprove.push("Quantifying project metrics & latency improvements", "Elaborating on architectural trade-offs");
    }

    // 4. Question Reviews
    const questionReviews = answeredQuestions.map((q) => ({
      questionIndex: q.questionIndex,
      category: q.category,
      questionText: q.questionText,
      candidateAnswerText: q.candidateAnswerText || "",
      score: q.evaluation?.overallScore || 75,
      evaluation: q.evaluation!,
      requirementReference: profile.requiredSkills[q.questionIndex % profile.requiredSkills.length] || profile.targetJobTitle,
    }));

    // 5. Tailored 7-Day Preparation Plan
    const preparationPlan = this.generate7DayPrepPlan(profile, areasToImprove);

    return {
      sessionId,
      targetJobTitle: profile.targetJobTitle,
      companyName: profile.companyName,
      overallScore,
      readinessScore,
      readinessLevel,
      categoryBreakdown: {
        technicalScore,
        communicationScore,
        roleAlignmentScore,
        projectKnowledgeScore,
        behavioralScore,
        problemSolvingScore,
      },
      roleReadinessBreakdown,
      strongestAreas: strongestAreas.slice(0, 4),
      areasToImprove: areasToImprove.slice(0, 4),
      questionReviews,
      preparationPlan,
      historyProgression: {
        previousAverage,
        currentAverage: overallScore,
        improvement: overallScore - previousAverage,
      },
    };
  }

  private static generate7DayPrepPlan(
    profile: CandidateIntelligenceProfile,
    weaknesses: string[]
  ): PreparationPlanDay[] {
    const skill1 = profile.requiredSkills[0] || "Backend Architecture";
    const skill2 = profile.requiredSkills[1] || "Databases & Indexing";
    const skill3 = profile.requiredSkills[2] || "System Design & Scaling";

    return [
      {
        day: 1,
        topic: `${skill1} Core Deep Dive`,
        whyItMatters: `Crucial core requirement for ${profile.targetJobTitle} roles.`,
        whatToRevise: ["Asynchronous concurrency & I/O models", "API validation & middleware design", "Error boundaries"],
        suggestedPractice: `Implement a sample RESTful microservice with connection pooling and validation.`,
        targetOutcome: `Confidently answer technical execution questions on ${skill1}.`,
      },
      {
        day: 2,
        topic: `${skill2} & Data Storage`,
        whyItMatters: "High-frequency interview topic for backend and full-stack positions.",
        whatToRevise: ["Query indexing & EXPLAIN plans", "ACID transactions & isolation levels", "Caching patterns"],
        suggestedPractice: "Design a schema migration and write benchmark queries using Redis caching.",
        targetOutcome: "Demonstrate database optimization skills with concrete examples.",
      },
      {
        day: 3,
        topic: `${skill3} & System Design`,
        whyItMatters: "Evaluates senior-level architectural thinking and trade-off analysis.",
        whatToRevise: ["Load balancing & horizontal scaling", "Message queues & event streaming", "Rate limiting"],
        suggestedPractice: "Draw an architecture diagram for a high-throughput notifications or file storage system.",
        targetOutcome: "Explain sub-100ms latency scaling strategies clearly.",
      },
      {
        day: 4,
        topic: "Resume Project Deep Dive & Probing",
        whyItMatters: "Interviewers challenge project claims and technical evidence on your resume.",
        whatToRevise: ["Architecture overview of your top 2 projects", "Why key technologies were selected", "Metrics & results"],
        suggestedPractice: "Prepare 2-minute elevator pitches for each featured project on your resume.",
        targetOutcome: "Explain architectural trade-offs without hesitation.",
      },
      {
        day: 5,
        topic: "Behavioral & STAR Method Mastery",
        whyItMatters: "Behavioral questions test teamwork, conflict resolution, and leadership.",
        whatToRevise: ["STAR format (Situation, Task, Action, Result)", "Conflict resolution examples", "Failure & learning stories"],
        suggestedPractice: "Draft 3 STAR stories covering teamwork, production incidents, and technical disagreements.",
        targetOutcome: "Structure behavioral responses with clear quantifiable results.",
      },
      {
        day: 6,
        topic: "Quantifying Impact & Metric Practice",
        whyItMatters: weaknesses[0] || "Measurable outcomes differentiate senior candidates.",
        whatToRevise: ["Percentile latency (p95/p99)", "Resource utilization & cost reductions", "Throughput metrics"],
        suggestedPractice: "Review your resume bullet points and add percentage or metric estimates.",
        targetOutcome: "Back up claims with verifiable engineering metrics.",
      },
      {
        day: 7,
        topic: "Full Simulated Mock Interview",
        whyItMatters: "Consolidates learning and verifies interview readiness under timed conditions.",
        whatToRevise: ["Review 7-day notes", "Practice voice articulation and timing"],
        suggestedPractice: "Re-run a full 30-minute AI Mock Interview on Vantory.",
        targetOutcome: "Achieve a Readiness Score of 85+.",
      },
    ];
  }

  private static generateEmptyReport(
    sessionId: string,
    profile: CandidateIntelligenceProfile
  ): FinalInterviewReport {
    return {
      sessionId,
      targetJobTitle: profile.targetJobTitle,
      companyName: profile.companyName,
      overallScore: 60,
      readinessScore: 60,
      readinessLevel: "Needs Preparation",
      categoryBreakdown: {
        technicalScore: 60,
        communicationScore: 60,
        roleAlignmentScore: 60,
        projectKnowledgeScore: 60,
        behavioralScore: 60,
        problemSolvingScore: 60,
      },
      roleReadinessBreakdown: {},
      strongestAreas: ["Session initiated"],
      areasToImprove: ["Complete full interview session to receive full report"],
      questionReviews: [],
      preparationPlan: this.generate7DayPrepPlan(profile, []),
      historyProgression: {
        previousAverage: 74,
        currentAverage: 60,
        improvement: -14,
      },
    };
  }
}
