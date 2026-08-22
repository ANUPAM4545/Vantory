import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/validation/auth";
import { sendContactEmail } from "@/lib/email/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    const trimmedName = (name || "").trim();
    const normalizedEmail = normalizeEmail(email || "");
    const trimmedPhone = (phone || "").trim();
    const trimmedSubject = (subject || "").trim();
    const trimmedMessage = (message || "").trim();

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 5 characters long." },
        { status: 400 }
      );
    }

    // Real-time Nodemailer Dispatch
    const emailResult = await sendContactEmail({
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone || undefined,
      subject: trimmedSubject || undefined,
      message: trimmedMessage,
    });

    const ticketId = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      message: "Support ticket created successfully.",
      ticketId,
      messageId: emailResult.messageId,
      isRealSmtp: emailResult.isRealSmtp,
    });
  } catch (err: unknown) {
    console.error("Support Contact API Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "We couldn't send your message right now. Please try again." },
      { status: 500 }
    );
  }
}
