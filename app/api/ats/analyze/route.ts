import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { parseStructuredResume, parsePlainTextResume } from "@/lib/ats/parser/resume-parser";
import { parseJobDescription } from "@/lib/ats/parser/job-parser";
import { generateATSReportSnapshot } from "@/lib/ats/scoring/scoring-engine";
import { sanitizeJdInput } from "@/lib/ats/security/prompt-guard";
import { ResumeData } from "@/lib/resume/types";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, uploadedResumeText, jobDescription, targetJobTitle } = body;

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json(
        { success: false, error: "Job description is required for ATS analysis." },
        { status: 400 }
      );
    }

    // 1. Obtain Parsed Resume (Prefer structured ResumeData if resumeId is provided)
    let parsedResume;
    let selectedResumeId: string | null = null;
    let resumeSnapshotStr = "{}";

    if (resumeId && typeof resumeId === "string") {
      const dbResume = await db.resume.findFirst({
        where: { id: resumeId, userId: user.id },
      });

      if (dbResume) {
        selectedResumeId = dbResume.id;
        try {
          const structuredData: ResumeData = JSON.parse(dbResume.contentJson);
          parsedResume = parseStructuredResume(structuredData);
          resumeSnapshotStr = dbResume.contentJson;
        } catch {
          parsedResume = parsePlainTextResume(dbResume.contentJson);
        }
      }
    }

    if (!parsedResume) {
      if (uploadedResumeText && typeof uploadedResumeText === "string") {
        parsedResume = parsePlainTextResume(uploadedResumeText);
      } else {
        // Fallback: Fetch user's latest resume from DB
        const latestResume = await db.resume.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
        });

        if (latestResume) {
          selectedResumeId = latestResume.id;
          try {
            const structuredData: ResumeData = JSON.parse(latestResume.contentJson);
            parsedResume = parseStructuredResume(structuredData);
            resumeSnapshotStr = latestResume.contentJson;
          } catch {
            parsedResume = parsePlainTextResume(latestResume.contentJson);
          }
        }
      }
    }

    if (!parsedResume) {
      return NextResponse.json(
        { success: false, error: "No valid resume found. Please select an existing resume or upload one." },
        { status: 400 }
      );
    }

    // 2. Parse Job Description (Sanitize prompt injection attempts)
    const cleanJdText = sanitizeJdInput(jobDescription);
    const parsedJd = parseJobDescription(cleanJdText, targetJobTitle);

    // 3. Orchestrate Analysis Pipeline & Generate Snapshot
    const snapshot = generateATSReportSnapshot(parsedResume, parsedJd);

    // 4. Save Scan Snapshot to Database
    const savedScan = await db.atsScan.create({
      data: {
        userId: user.id,
        resumeId: selectedResumeId,
        targetJobTitle: parsedJd.title,
        companyName: parsedJd.companyName || null,
        jobDescription: cleanJdText,
        overallScore: snapshot.jobMatchScore,
        resumeQualityScore: snapshot.resumeQualityScore,
        confidenceScore: snapshot.matchConfidenceScore,
        confidenceLevel: snapshot.confidenceLevel,
        keywordMatch: snapshot.breakdown.keywordCoverage,
        skillsMatch: snapshot.breakdown.skillsMatch,
        experienceMatch: snapshot.breakdown.experienceRelevance,
        educationMatch: snapshot.breakdown.educationMatch,
        formattingScore: snapshot.breakdown.atsParseability,
        scoringEngineVersion: snapshot.scoringEngineVersion,
        taxonomyVersion: snapshot.taxonomyVersion,
        analysisStatus: "COMPLETED",
        reportSnapshotJson: JSON.stringify(snapshot),
        resumeSnapshotJson: resumeSnapshotStr,
        feedbackJson: JSON.stringify(snapshot.recommendations),
      },
    });

    snapshot.scanId = savedScan.id;

    return NextResponse.json({
      success: true,
      scanId: savedScan.id,
      snapshot,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal ATS Server Error.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
