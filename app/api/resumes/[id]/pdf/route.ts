import { NextResponse } from "next/server";
import { generateLatexSource } from "@/lib/resume/latex/renderer";
import { ResumeData } from "@/lib/resume/types";
import { db } from "@/lib/db";
import { parseResumeContent } from "@/lib/resume/serialization";
import { compileResumePdf } from "@/lib/resume/pdf-compiler";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const format = url.searchParams.get("format");

    const resume = await db.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
    }

    const resumeData = parseResumeContent(resume.contentJson);

    // If json or tex format explicitly requested
    if (format === "json" || format === "tex") {
      const latexSource = generateLatexSource(resumeData);
      return NextResponse.json({
        success: true,
        title: resume.title,
        latexSource,
        resumeData,
        downloadFileName: `${(resumeData.personalInfo?.fullName || "Resume").replace(/\s+/g, "_")}_Vantory.pdf`,
      });
    }

    // Authoritative PDF Compilation
    const pdfResult = await compileResumePdf(resumeData);

    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfResult.fileName}"`,
        "Content-Length": pdfResult.buffer.length.toString(),
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "PDF load failed.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  request: Request
) {
  try {
    const body: ResumeData = await request.json();
    if (!body || !body.personalInfo) {
      return NextResponse.json({ success: false, error: "Invalid ResumeData payload" }, { status: 400 });
    }

    const pdfResult = await compileResumePdf(body);

    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfResult.fileName}"`,
        "Content-Length": pdfResult.buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("PDF Compilation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "PDF generation failed.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
