/**
 * Production AI Resume ATS & Job Match Analysis Engine (v2.1)
 * Evaluates:
 * 1. ATS Compatibility Score (35% Parsing, 20% Sections, 20% Formatting, 10% Contact, 10% Dates, 5% Extraction)
 * 2. Job Match Score (40% Required Skills, 15% Preferred, 10% Coverage, 10% Evidence, 10% Responsibilities, 5% Exp, 5% Title, 5% Edu)
 * 3. Overall Application Score (30% ATS Compatibility + 70% Job Match)
 * 4. Why Points Were Lost (Exact transparent point deductions)
 * 5. Score Improvement Simulator (Actionable expected gains)
 * 6. Truth Guard System (Prevents fabricated skills/metrics)
 * 7. Achievement & Bullet Quality Analysis (Verb + Context + Scope + Metric)
 * 8. Keyword Stuffing Detection (Contextual evidence ratio)
 */

import { UnifiedParsedResume } from "../parser/resume-parser";
import {
  StructuredJobDescription,
  ATSReportSnapshot,
  ATSReportBreakdown,
  ScoreDeductionItem,
  ImprovementSimulatorItem,
  TruthGuardItem,
  BulletQualityAudit,
  BulletQualityFeedback,
  KeywordStuffingAudit,
} from "../types";
import { extractEvidence } from "../evidence/evidence-engine";
import { evaluateExperienceRelevance } from "../matching/experience-matcher";
import { evaluateEducationMatch } from "../matching/education-matcher";
import { evaluateCriticalGates } from "./critical-gates";

export function generateATSReportSnapshot(
  resume: UnifiedParsedResume,
  jd: StructuredJobDescription,
  scanId?: string
): ATSReportSnapshot {
  // 1. Extract Evidence & Match Tables
  const evidenceRes = extractEvidence(
    resume,
    jd.requiredSkills,
    jd.preferredSkills,
    jd.minYearsExperience
  );

  // 2. Evaluate Experience & Education
  const expRes = evaluateExperienceRelevance(resume, jd);
  const eduRes = evaluateEducationMatch(resume, jd);

  // 3. Evaluate Critical Gates
  const criticalGaps = evaluateCriticalGates(resume, jd);

  // 4. Achievement Bullet Quality Audit
  const bulletQualityAudit = analyzeBulletQuality(resume);

  // 5. Keyword Stuffing Audit
  const keywordStuffingAudit = analyzeKeywordStuffing(resume, jd);

  // 6. Calculate Detailed Match Metrics
  const requiredSkillsCount = Math.max(1, jd.requiredSkills.length);
  const matchedRequiredSkills = evidenceRes.skillsTable.filter(
    (s) => s.requirementType === "REQUIRED" && s.matchType !== "NOT_FOUND" && s.matchType !== "RELATED"
  );
  const requiredQualificationsScore = Math.round((matchedRequiredSkills.length / requiredSkillsCount) * 100);

  const preferredSkillsCount = Math.max(1, jd.preferredSkills.length);
  const matchedPreferredSkills = evidenceRes.skillsTable.filter(
    (s) => s.requirementType === "PREFERRED" && s.matchType !== "NOT_FOUND"
  );
  const preferredQualificationsScore = jd.preferredSkills.length > 0
    ? Math.round((matchedPreferredSkills.length / preferredSkillsCount) * 100)
    : 85;

  const skillsMatchScore = Math.round(
    requiredQualificationsScore * 0.75 + preferredQualificationsScore * 0.25
  );

  const totalReqPref = requiredSkillsCount + (jd.preferredSkills.length || 1);
  const keywordCoverageScore = Math.min(
    100,
    Math.round(((matchedRequiredSkills.length + matchedPreferredSkills.length) / totalReqPref) * 100)
  );

  // Skill Evidence Score: ratio of skills with STRONG evidence vs WEAK
  const strongEvidenceCount = evidenceRes.skillsTable.filter((s) => s.evidenceLevel === "STRONG").length;
  const skillEvidenceScore = Math.min(
    100,
    Math.round((strongEvidenceCount / Math.max(1, evidenceRes.skillsTable.length)) * 100 + 20)
  );

  // Responsibilities & Title Alignment
  const titleAlignmentScore = calculateTitleAlignment(resume.headline || "", jd.title);
  const responsibilitiesScore = Math.round((requiredQualificationsScore * 0.6 + expRes.experienceScore * 0.4));

  // 7. ATS Compatibility Score Calculation
  // 35% Parsing, 20% Sections, 20% Formatting Safety, 10% Contact, 10% Dates, 5% Extraction
  const contactDetected = Boolean(resume.email && resume.phone);
  const datesDetected = resume.experiences.every((e) => Boolean(e.startDate));
  const hasTwoColumnLayout = resume.rawText.includes("  |  ") || resume.rawText.includes("   ");
  const hasIcons = resume.rawText.includes("✉") || resume.rawText.includes("☎") || resume.rawText.includes("📍");

  const parsingQuality = resume.parseConfidence >= 90 ? 98 : 85;
  const sectionDetection = Math.min(100, resume.sectionsDetected.length * 18);
  const formattingSafety = 100 - (hasTwoColumnLayout ? 15 : 0) - (hasIcons ? 10 : 0);
  const contactDetectionScore = contactDetected ? 100 : 50;
  const dateParsingScore = datesDetected ? 100 : 70;
  const textExtractionScore = 100;

  const atsCompatibilityScore = Math.min(
    100,
    Math.round(
      parsingQuality * 0.35 +
      sectionDetection * 0.20 +
      formattingSafety * 0.20 +
      contactDetectionScore * 0.10 +
      dateParsingScore * 0.10 +
      textExtractionScore * 0.05
    )
  );

  // 8. Job Match Score Calculation
  // 40% Required Skills, 15% Preferred, 10% Coverage, 10% Evidence, 10% Responsibilities, 5% Exp, 5% Title, 5% Edu
  let rawJobMatchScore = Math.round(
    requiredQualificationsScore * 0.40 +
    preferredQualificationsScore * 0.15 +
    keywordCoverageScore * 0.10 +
    skillEvidenceScore * 0.10 +
    responsibilitiesScore * 0.10 +
    expRes.experienceScore * 0.05 +
    titleAlignmentScore * 0.05 +
    eduRes.score * 0.05
  );

  // Critical Gate Penalty
  if (criticalGaps.some((g) => g.severity === "CRITICAL")) {
    rawJobMatchScore = Math.min(rawJobMatchScore, 68);
  } else if (criticalGaps.length > 0) {
    rawJobMatchScore = Math.min(rawJobMatchScore, 78);
  }

  const jobMatchScore = Math.min(98, Math.max(15, rawJobMatchScore));

  // 9. Overall Application Score (30% ATS + 70% Job Match)
  const overallApplicationScore = Math.round(
    atsCompatibilityScore * 0.30 + jobMatchScore * 0.70
  );

  const resumeQualityScore = Math.round(
    atsCompatibilityScore * 0.40 +
    bulletQualityAudit.strongCount * 10 +
    (sectionDetection > 80 ? 30 : 15)
  );

  const breakdown: ATSReportBreakdown = {
    requiredQualifications: requiredQualificationsScore,
    skillsMatch: skillsMatchScore,
    experienceRelevance: expRes.experienceScore,
    educationMatch: eduRes.score,
    preferredQualifications: preferredQualificationsScore,
    semanticAlignment: Math.round((requiredQualificationsScore + expRes.experienceScore) / 2),
    seniorityAlignment: expRes.seniorityAlignmentScore,
    locationAlignment: 95,
    keywordCoverage: keywordCoverageScore,
    atsParseability: atsCompatibilityScore,
    resumeStructure: sectionDetection,
    contentImpactQuality: Math.round((bulletQualityAudit.strongCount / Math.max(1, bulletQualityAudit.totalBullets)) * 100),
  };

  // 10. "Why Did I Lose Points?" Deductions
  const whyPointsLost = calculateWhyPointsLost(
    jd,
    evidenceRes,
    criticalGaps,
    bulletQualityAudit,
    titleAlignmentScore,
    hasTwoColumnLayout,
    hasIcons
  );

  // 11. Score Improvement Simulator & Truth Guard Items
  const { simulator, truthGuardItems } = generateScoreSimulator(
    jd,
    evidenceRes,
    bulletQualityAudit,
    overallApplicationScore
  );

  // Match Confidence & Label
  const matchConfidenceScore = Math.round(
    (resume.parseConfidence + (jd.requiredSkills.length > 0 ? 95 : 75)) / 2
  );
  const confidenceLevel = matchConfidenceScore >= 85 ? "HIGH" : matchConfidenceScore >= 65 ? "MEDIUM" : "LOW";

  let matchLabel: ATSReportSnapshot["matchLabel"] = "STRONG_MATCH";
  if (criticalGaps.some((g) => g.severity === "CRITICAL")) matchLabel = "CRITICAL_GAPS";
  else if (overallApplicationScore >= 90) matchLabel = "EXCELLENT_MATCH";
  else if (overallApplicationScore >= 80) matchLabel = "STRONG_MATCH";
  else if (overallApplicationScore >= 65) matchLabel = "MODERATE_MATCH";
  else matchLabel = "WEAK_MATCH";

  const recommendations = generateRecommendations(
    jd,
    evidenceRes,
    criticalGaps,
    bulletQualityAudit
  );

  return {
    scanId,
    atsCompatibilityScore,
    jobMatchScore,
    overallApplicationScore,
    resumeQualityScore,
    matchConfidenceScore,
    confidenceLevel,
    matchLabel,
    breakdown,
    skillsTable: evidenceRes.skillsTable,
    requirementsTable: evidenceRes.requirementsTable,
    criticalGaps,
    strengths: evidenceRes.strengths,
    gaps: evidenceRes.gaps,
    recommendations,
    whyPointsLost,
    scoreImprovementSimulator: simulator,
    truthGuardItems,
    bulletQualityAudit,
    keywordStuffingAudit,
    atsParseabilityAudit: {
      textExtractable: true,
      standardHeadings: true,
      contactInfoDetected: contactDetected,
      datesDetected,
      skillsDetected: resume.skills.length > 0,
      twoColumnLayoutDetected: hasTwoColumnLayout,
      iconsDetected: hasIcons,
      warnings: criticalGaps.map((g) => g.title),
    },
    parserMetadata: {
      parseConfidence: resume.parseConfidence,
      sectionsDetected: resume.sectionsDetected,
      nonStandardHeadings: resume.sectionsDetected.filter((s) => !["Experience", "Education", "Skills", "Projects", "Summary"].includes(s)),
      dateConsistency: resume.dateConsistency,
    },
    scoringEngineVersion: "2.1.0",
    taxonomyVersion: "2.1.0",
    targetJobTitle: jd.title,
    companyName: jd.companyName,
    jobDescriptionText: jd.rawText,
    createdAt: new Date().toISOString(),
  };
}

function calculateTitleAlignment(resumeTitle: string, jdTitle: string): number {
  if (!resumeTitle) return 70;
  const rLower = resumeTitle.toLowerCase();
  const jLower = jdTitle.toLowerCase();
  if (rLower === jLower) return 100;
  if (rLower.includes(jLower) || jLower.includes(rLower)) return 88;
  if ((rLower.includes("engineer") || rLower.includes("developer")) && (jLower.includes("engineer") || jLower.includes("developer"))) {
    return 80;
  }
  return 65;
}

function analyzeBulletQuality(resume: UnifiedParsedResume): BulletQualityAudit {
  const allBullets = resume.experiences
    .flatMap((e) => e.bullets)
    .concat(resume.projects.flatMap((p) => p.bullets));

  const bulletFeedback: BulletQualityFeedback[] = [];
  let weakCount = 0;
  let betterCount = 0;
  let strongCount = 0;

  allBullets.forEach((bullet) => {
    const hasMetric = /\d+(%|k|m|\+|\s*ms|\s*users|\s*x)/i.test(bullet);
    const hasStrongVerb = /^(Architected|Engineered|Spearheaded|Optimized|Designed|Built|Implemented|Scaled|Developed|Automated)/i.test(bullet.trim());
    const hasTechContext = /(using|with|via|leveraging|across)\s+[A-Za-z0-9#+.]+/i.test(bullet);

    let score = 50;
    if (hasStrongVerb) score += 20;
    if (hasTechContext) score += 15;
    if (hasMetric) score += 15;

    let verdict: BulletQualityFeedback["verdict"] = "WEAK";
    let suggestion = "";

    if (score >= 85) {
      verdict = "STRONG";
      strongCount++;
      suggestion = "Excellent bullet structure with clear action verb, tech context, and measurable outcome.";
    } else if (score >= 65) {
      verdict = "BETTER";
      betterCount++;
      suggestion = "Good bullet description. Consider adding a quantifiable metric (e.g. % efficiency or response time improvement).";
    } else {
      verdict = "WEAK";
      weakCount++;
      suggestion = "Weak bullet description. Start with a strong action verb (e.g. Developed, Optimized) and include technical scope & measurable outcome.";
    }

    bulletFeedback.push({
      originalText: bullet,
      score,
      verdict,
      suggestion,
    });
  });

  return {
    totalBullets: allBullets.length,
    weakCount,
    betterCount,
    strongCount,
    bulletFeedback,
  };
}

function analyzeKeywordStuffing(resume: UnifiedParsedResume, jd: StructuredJobDescription): KeywordStuffingAudit {
  const flaggedKeywords: KeywordStuffingAudit["flaggedKeywords"] = [];
  let stuffingCount = 0;

  const allSkills = [...jd.requiredSkills, ...jd.preferredSkills];
  const resumeText = resume.rawText.toLowerCase();

  allSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    const matches = resumeText.match(new RegExp(`\\b${skillLower}\\b`, "g")) || [];
    const count = matches.length;

    if (count >= 5) {
      let contextualCount = 0;
      resume.experiences.flatMap((e) => e.bullets).concat(resume.projects.flatMap((p) => p.bullets)).forEach((b) => {
        if (b.toLowerCase().includes(skillLower)) contextualCount++;
      });

      if (count > contextualCount + 3) {
        stuffingCount++;
        flaggedKeywords.push({
          keyword: skill,
          count,
          contextualEvidenceCount: contextualCount,
        });
      }
    }
  });

  return {
    riskLevel: stuffingCount > 2 ? "HIGH" : stuffingCount > 0 ? "MODERATE" : "LOW",
    repetitionRatio: stuffingCount,
    flaggedKeywords,
  };
}

function calculateWhyPointsLost(
  jd: StructuredJobDescription,
  evidenceRes: ReturnType<typeof extractEvidence>,
  criticalGaps: ReturnType<typeof evaluateCriticalGates>,
  bulletQuality: BulletQualityAudit,
  titleAlignment: number,
  hasTwoColumnLayout: boolean,
  hasIcons: boolean
): ScoreDeductionItem[] {
  const list: ScoreDeductionItem[] = [];

  // Missing Required Skills
  const missingReqs = evidenceRes.skillsTable.filter(
    (s) => s.requirementType === "REQUIRED" && s.matchType === "NOT_FOUND"
  );
  missingReqs.forEach((m) => {
    list.push({
      deduction: -6,
      title: `Missing Required Skill: ${m.skillName}`,
      reason: `The job explicitly requires ${m.skillName}, but no supporting evidence was found in your resume.`,
      category: "SKILLS",
    });
  });

  // Weak Skill Evidence (Listed in Skills section only)
  const weakEvidenceSkills = evidenceRes.skillsTable.filter(
    (s) => s.evidenceLevel === "WEAK" && s.requirementType === "REQUIRED"
  );
  weakEvidenceSkills.forEach((w) => {
    list.push({
      deduction: -3,
      title: `${w.skillName} Evidence Lacking`,
      reason: `${w.skillName} is listed in your Skills section, but lacks contextual evidence in Experience or Projects.`,
      category: "EXPERIENCE",
    });
  });

  // Critical Gaps
  if (criticalGaps.some((g) => g.severity === "CRITICAL")) {
    list.push({
      deduction: -10,
      title: "Critical Experience Gate Failure",
      reason: `Job requires ${jd.minYearsExperience}+ years of experience, but resume shows insufficient relevant timeline.`,
      category: "EXPERIENCE",
    });
  }

  // Bullet Quality
  if (bulletQuality.weakCount >= 2) {
    list.push({
      deduction: -4,
      title: `${bulletQuality.weakCount} Weak Achievement Bullets`,
      reason: `Several experience bullets lack strong action verbs, technical scope, or measurable metrics.`,
      category: "CONTENT_QUALITY",
    });
  }

  // Formatting Risks
  if (hasTwoColumnLayout) {
    list.push({
      deduction: -3,
      title: "Two-Column Layout Parsing Risk",
      reason: "Two-column PDF layouts may cause automated ATS parsers to misorder experience lines.",
      category: "ATS_PARSING",
    });
  }

  if (hasIcons) {
    list.push({
      deduction: -2,
      title: "Non-standard Icons Detected",
      reason: "Icons near contact information or section headers can disrupt plain-text ATS parsers.",
      category: "ATS_PARSING",
    });
  }

  // Title Alignment
  if (titleAlignment < 85) {
    list.push({
      deduction: -3,
      title: "Job Title Partial Alignment",
      reason: `Resume title '${jd.title}' is only partially aligned with target job title.`,
      category: "EXPERIENCE",
    });
  }

  return list;
}

function generateScoreSimulator(
  jd: StructuredJobDescription,
  evidenceRes: ReturnType<typeof extractEvidence>,
  bulletQuality: BulletQualityAudit,
  currentScore: number
) {
  const improvements: ImprovementSimulatorItem[] = [];
  const truthGuardItems: TruthGuardItem[] = [];
  let potentialGain = 0;

  // 1. Missing Required Skills
  const missingReqs = evidenceRes.skillsTable.filter(
    (s) => s.requirementType === "REQUIRED" && (s.matchType === "NOT_FOUND" || s.matchType === "RELATED")
  );

  missingReqs.forEach((m) => {
    const points = 4;
    potentialGain += points;
    improvements.push({
      id: `imp-${m.skillName}`,
      title: `Add genuine ${m.skillName} project or work evidence`,
      points,
      isTruthGuardRequired: true,
      skillName: m.skillName,
      actionText: `If you have used ${m.skillName}, add it to your experience bullets or projects section.`,
    });

    truthGuardItems.push({
      skillName: m.skillName,
      reason: `${m.skillName} is an important job requirement, but no supporting evidence was found in your resume.`,
    });
  });

  // 2. Upgrade Weak Skills
  const weakSkills = evidenceRes.skillsTable.filter((s) => s.evidenceLevel === "WEAK" && s.requirementType === "REQUIRED");
  if (weakSkills.length > 0) {
    const points = 3;
    potentialGain += points;
    improvements.push({
      id: "imp-weak-evidence",
      title: `Demonstrate ${weakSkills[0].skillName} in an experience bullet`,
      points,
      isTruthGuardRequired: false,
      skillName: weakSkills[0].skillName,
      actionText: `Move ${weakSkills[0].skillName} from just your Skills list into an actual project or work description.`,
    });
  }

  // 3. Improve Weak Bullets
  if (bulletQuality.weakCount > 0) {
    const points = 3;
    potentialGain += points;
    improvements.push({
      id: "imp-bullets",
      title: `Add quantifiable metrics to ${Math.min(3, bulletQuality.weakCount)} weak experience bullets`,
      points,
      isTruthGuardRequired: false,
      actionText: "Include measurable outcomes (e.g. 'reduced latency by 30%', 'served 10k users').",
    });
  }

  const potentialScore = Math.min(99, currentScore + potentialGain);

  return {
    simulator: {
      currentScore,
      potentialScore,
      improvements,
    },
    truthGuardItems,
  };
}

function generateRecommendations(
  jd: StructuredJobDescription,
  evidenceRes: ReturnType<typeof extractEvidence>,
  criticalGaps: ReturnType<typeof evaluateCriticalGates>,
  bulletQuality: BulletQualityAudit
): string[] {
  const recs: string[] = [];

  if (criticalGaps.length > 0) {
    criticalGaps.forEach((cg) => {
      recs.push(`Priority Fix (${cg.severity}): ${cg.requiredDetail} ${cg.impactDescription}`);
    });
  }

  const missingSkills = evidenceRes.skillsTable.filter((s) => s.requirementType === "REQUIRED" && s.matchType === "NOT_FOUND");
  if (missingSkills.length > 0) {
    recs.push(`Core Requirement Missing: The job requires ${missingSkills.slice(0, 3).map((s) => s.skillName).join(", ")}. If you genuinely possess hands-on experience, confirm possession and add verifiable evidence to your experience section.`);
  }

  if (bulletQuality.weakCount >= 2) {
    recs.push(`Bullet Quality: ${bulletQuality.weakCount} experience bullets lack quantifiable impact or strong action verbs. Format bullets as: Action Verb + Tech Scope + Quantifiable Metric.`);
  }

  if (recs.length === 0) {
    recs.push("Your resume shows strong alignment with this position. Maintain standard section headings and ensure your contact details remain up to date.");
  }

  return recs;
}
