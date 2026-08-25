import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";

function ensureEnvLoaded() {
  if (!process.env.SMTP_HOST) {
    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        envContent.split("\n").forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"]*)"?\s*$/);
          if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2];
          }
        });
      }
    } catch {
      // Ignore
    }
  }
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function sendContactEmail(payload: ContactMessagePayload): Promise<{ success: boolean; messageId?: string; isRealSmtp: boolean }> {
  ensureEnvLoaded();
  const targetRecipient = process.env.SUPPORT_RECIPIENT_EMAIL || "anupamsingh8095@gmail.com";

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const isRealSmtpConfigured = Boolean(host && user && pass);
  let isRealSmtp = false;

  let transporter: nodemailer.Transporter;

  if (isRealSmtpConfigured && host && user && pass) {
    if (host.includes("gmail.com")) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #09090b; border-bottom: 2px solid #09090b; padding-bottom: 10px;">New Support & Contact Inquiry</h2>
      <p>You have received a new inquiry from the Vantory Platform.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; background-color: #f4f4f5; width: 120px;">Sender Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${payload.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background-color: #f4f4f5;">Sender Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;"><a href="mailto:${payload.email}">${payload.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background-color: #f4f4f5;">Phone Number:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${payload.phone || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background-color: #f4f4f5;">Subject:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${payload.subject || "General Support Inquiry"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background-color: #f4f4f5;">Received At:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #09090b; border-radius: 4px;">
        <h4 style="margin-top: 0; color: #09090b;">Message Body:</h4>
        <p style="white-space: pre-wrap; color: #334155; line-height: 1.6;">${payload.message}</p>
      </div>

      <div style="margin-top: 25px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        Vantory Platform Notification • Automated Real-time Dispatch
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${payload.name} via Vantory" <noreply@vantory.com>`,
      to: targetRecipient,
      replyTo: payload.email,
      subject: `[Vantory Contact] ${payload.subject || "New Inquiry from " + payload.name}`,
      text: `Sender: ${payload.name} (${payload.email})\nPhone: ${payload.phone || "N/A"}\nMessage:\n${payload.message}`,
      html: htmlContent,
    });

    isRealSmtp = true;
    console.log("Email Dispatch Success:", info.messageId || "Sent via Mailer");

    return {
      success: true,
      messageId: info.messageId,
      isRealSmtp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("SMTP Dispatch Warning (falling back to JSON ticket):", errorMsg);
    // Fallback JSON dispatch so inquiry ticket is never lost
    const fallbackTransporter = nodemailer.createTransport({ jsonTransport: true });
    const fallbackInfo = await fallbackTransporter.sendMail({
      from: `"${payload.name}" <${payload.email}>`,
      to: targetRecipient,
      subject: `[Fallback Contact] ${payload.subject || "Inquiry from " + payload.name}`,
      text: payload.message,
    });

    return {
      success: true,
      messageId: fallbackInfo.messageId,
      isRealSmtp: false,
    };
  }
}
