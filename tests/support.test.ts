import test from "node:test";
import assert from "node:assert/strict";
import { sendContactEmail } from "../lib/email/mailer";

test("Nodemailer Email Dispatch — Sends real-time email inquiry", async () => {
  const result = await sendContactEmail({
    name: "Anupam Singh Test",
    email: "anupamsingh8095@gmail.com",
    phone: "7307679920",
    subject: "Test Realtime Inquiry",
    message: "This is a real-time inquiry message test for SkillAssociate Support.",
  });

  assert.equal(result.success, true);
  assert.ok(result.messageId != null || result.success === true);
});
