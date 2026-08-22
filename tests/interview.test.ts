import test from "node:test";
import assert from "node:assert/strict";
import { buildInterviewContext } from "../lib/interview/context-builder";
import { QuestionGenerator } from "../lib/interview/question-generator";
import { DifficultyController } from "../lib/interview/difficulty-controller";
import { FollowUpEngine } from "../lib/interview/follow-up-engine";
import { AnswerEvaluator } from "../lib/interview/answer-evaluator";
import { ReportGenerator } from "../lib/interview/report-generator";
import { CandidateIntelligenceProfile, EvaluatedQuestion, InterviewSetupConfig, QuestionEvaluation } from "../lib/interview/types";

test("AI Mock Interview Engine — Context Builder & Intelligence Extraction", async () => {
  const config: InterviewSetupConfig = {
    targetJobTitle: "Senior Backend Engineer",
    companyName: "Identity",
    jobDescription: "We need a Senior Backend Engineer proficient in Python, FastAPI, PostgreSQL, Redis, and Docker.",
    interviewType: "FULL",
    difficulty: "Medium",
    durationMinutes: 20,
    interviewerStyle: "Professional",
  };

  const resumeJson = JSON.stringify({
    skills: [{ category: "Backend", skills: ["Python", "FastAPI", "PostgreSQL"] }],
    experience: [{ role: "Backend Developer", company: "Acme Inc", bullets: ["Built scalable REST APIs using FastAPI and PostgreSQL."] }],
    projects: [{ title: "Distributed Storage Platform", techStack: ["Python", "FastAPI", "Redis"] }],
  });

  const profile = await buildInterviewContext(config, resumeJson);

  assert.equal(profile.targetJobTitle, "Senior Backend Engineer");
  assert.equal(profile.companyName, "Identity");
  assert.ok(profile.requiredSkills.includes("Python") || profile.strongAreas.includes("Python"));
  assert.ok(profile.requiredSkills.includes("FastAPI") || profile.strongAreas.includes("FastAPI"));
  assert.ok(profile.extractedProjects.length > 0);
  assert.equal(profile.extractedProjects[0].title, "Distributed Storage Platform");
});

test("AI Mock Interview Engine — Uploaded Resume Plain Text Extraction", async () => {
  const config: InterviewSetupConfig = {
    targetJobTitle: "Senior Backend Engineer",
    companyName: "Identity",
    jobDescription: "Python, FastAPI, PostgreSQL",
    interviewType: "FULL",
    difficulty: "Medium",
    durationMinutes: 20,
    interviewerStyle: "Professional",
  };

  const uploadedText = `ANUPAM SINGH
Senior Backend Engineer
Email: anupam@example.com

SKILLS
Python, FastAPI, PostgreSQL, Redis, Kubernetes, Docker

EXPERIENCE
Lead Developer at Identity Platform (2024-Present)
- Engineered scalable microservices with 99.99% uptime.
- Reduced p99 latency from 250ms to 45ms using Redis caching.

PROJECTS
Real-Time Event Streamer
Built high-throughput websocket engine using Python and FastAPI.`;

  const profile = await buildInterviewContext(config, uploadedText);

  assert.equal(profile.targetJobTitle, "Senior Backend Engineer");
  assert.ok(profile.strongAreas.includes("Python") || profile.requiredSkills.includes("Python"));
  assert.ok(profile.extractedExperience.length > 0);
});

test("AI Mock Interview Engine — Adaptive Question Generator", async () => {
  const profile: CandidateIntelligenceProfile = {
    targetJobTitle: "Backend Engineer",
    jobDescription: "FastAPI, PostgreSQL, Redis",
    requiredSkills: ["FastAPI", "PostgreSQL", "Redis"],
    preferredSkills: ["Docker", "AWS"],
    extractedExperience: ["Backend Engineer at Acme"],
    extractedProjects: [{ title: "Real-time Messaging API", techStack: ["FastAPI", "Redis"] }],
    resumeEvidenceSnippets: ["Built Redis caching layer"],
    weakAreas: ["System Design"],
    strongAreas: ["Python", "FastAPI"],
  };

  // Test opening question category
  const openingCategory = QuestionGenerator.selectNextCategory({
    questionIndex: 0,
    interviewType: "FULL",
    coveredTopics: [],
    weakTopics: [],
  });
  assert.equal(openingCategory, "Introduction & Role Fit");

  // Test adaptive question generation
  const question = await QuestionGenerator.generateNextQuestion({
    profile,
    interviewType: "FULL",
    difficulty: "Medium",
    interviewerStyle: "Professional",
    questionIndex: 1,
    previousQuestions: [],
    previousAnswers: [],
    weakTopics: profile.weakAreas,
    coveredTopics: [],
  });

  assert.ok(question.questionText.length > 20);
  assert.ok(question.category.length > 0);
});

test("AI Mock Interview Engine — Dynamic Difficulty Adjustment", () => {
  const evaluations: QuestionEvaluation[] = [
    {
      technicalAccuracy: 90,
      relevance: 90,
      depth: 88,
      completeness: 85,
      evidenceScore: 90,
      communication: 92,
      overallScore: 90,
      feedback: "Excellent response",
      strengths: ["Clear execution"],
      missingElements: [],
      improvementSuggestions: [],
      exampleAnswerStructure: "Sample structure",
      credibilityConcern: false,
    },
    {
      technicalAccuracy: 88,
      relevance: 92,
      depth: 86,
      completeness: 88,
      evidenceScore: 85,
      communication: 90,
      overallScore: 88,
      feedback: "Strong response",
      strengths: ["Clear evidence"],
      missingElements: [],
      improvementSuggestions: [],
      exampleAnswerStructure: "Sample structure",
      credibilityConcern: false,
    },
  ];

  const nextDifficulty = DifficultyController.calculateNextDifficulty("Medium", evaluations);
  assert.equal(nextDifficulty, "Hard");

  const nextProficiency = DifficultyController.calculateUpdatedProficiency("Competent", evaluations);
  assert.equal(nextProficiency, "Strong");
});

test("AI Mock Interview Engine — Follow-Up Trigger Detection", () => {
  const weakEvaluation: QuestionEvaluation = {
    technicalAccuracy: 60,
    relevance: 70,
    depth: 50,
    completeness: 45,
    evidenceScore: 50,
    communication: 65,
    overallScore: 58,
    feedback: "Lacks technical depth",
    strengths: [],
    missingElements: ["Architecture details"],
    improvementSuggestions: ["Explain trade-offs"],
    exampleAnswerStructure: "Sample structure",
    credibilityConcern: false,
  };

  const shouldTrigger = FollowUpEngine.shouldTriggerFollowUp({
    candidateAnswerText: "We used Redis for caching.",
    evaluation: weakEvaluation,
    followUpCount: 0,
  });

  assert.equal(shouldTrigger, true);
});

test("AI Mock Interview Engine — Live Answer Evaluator", async () => {
  const profile: CandidateIntelligenceProfile = {
    targetJobTitle: "Backend Engineer",
    jobDescription: "FastAPI, PostgreSQL",
    requiredSkills: ["FastAPI", "PostgreSQL"],
    preferredSkills: [],
    extractedExperience: [],
    extractedProjects: [{ title: "Core API" }],
    resumeEvidenceSnippets: [],
    weakAreas: [],
    strongAreas: ["Python"],
  };

  const evaluation = await AnswerEvaluator.evaluateCandidateAnswer({
    questionText: "How do you handle database connection pooling in FastAPI?",
    category: "Technical Fundamentals",
    candidateAnswerText: "We configure asynchronous connection pooling using SQLAlchemy and asyncpg, maintaining max pool connections of 20 with recycled timeouts to prevent stale socket connections.",
    profile,
    difficulty: "Medium",
    interviewerStyle: "Professional",
  });

  assert.ok(evaluation.technicalAccuracy >= 70);
  assert.ok(evaluation.overallScore >= 70);
  assert.ok(evaluation.strengths.length > 0);
  assert.ok(evaluation.exampleAnswerStructure.length > 10);
});

test("AI Mock Interview Engine — Final Report & 7-Day Prep Plan Generation", () => {
  const profile: CandidateIntelligenceProfile = {
    targetJobTitle: "Senior Backend Engineer",
    companyName: "Identity",
    jobDescription: "Python, FastAPI, PostgreSQL",
    requiredSkills: ["Python", "FastAPI", "PostgreSQL"],
    preferredSkills: ["Docker"],
    extractedExperience: [],
    extractedProjects: [{ title: "High-Throughput API" }],
    resumeEvidenceSnippets: [],
    weakAreas: ["System Design"],
    strongAreas: ["Python"],
  };

  const sampleEvaluation: QuestionEvaluation = {
    technicalAccuracy: 85,
    relevance: 90,
    depth: 80,
    completeness: 82,
    evidenceScore: 85,
    communication: 88,
    overallScore: 85,
    feedback: "Strong overall response demonstrating practical experience.",
    strengths: ["Clear technical execution"],
    missingElements: ["Specific metrics"],
    improvementSuggestions: ["Quantify latency reductions"],
    exampleAnswerStructure: "Structure sample",
    credibilityConcern: false,
  };

  const evaluatedQuestions: EvaluatedQuestion[] = [
    {
      id: "q1",
      sessionId: "session-1",
      questionIndex: 1,
      category: "Technical Fundamentals",
      questionText: "Explain FastAPI async handlers.",
      candidateAnswerText: "FastAPI uses Python async/await syntax to handle non-blocking I/O operations.",
      evaluation: sampleEvaluation,
      isFollowUp: false,
    },
  ];

  const report = ReportGenerator.generateFinalReport({
    sessionId: "session-1",
    profile,
    evaluatedQuestions,
    previousAverage: 75,
  });

  assert.equal(report.sessionId, "session-1");
  assert.equal(report.targetJobTitle, "Senior Backend Engineer");
  assert.ok(report.overallScore >= 70);
  assert.equal(report.preparationPlan.length, 7);
  assert.equal(report.preparationPlan[0].day, 1);
});
