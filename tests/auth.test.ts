import test from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { signToken, verifyToken } from "../lib/auth/jwt";
import { validateRegistration, validateLogin, normalizeEmail } from "../lib/validation/auth";
import { hasRole } from "../lib/auth/authorization";

test("Password Hashing & Verification", async () => {
  const plainPassword = "SuperSecretPassword123!";
  const hash = await hashPassword(plainPassword);

  assert.ok(hash !== plainPassword, "Password hash must not equal plain text");
  assert.ok(hash.startsWith("$2"), "Hash must be a valid bcrypt string");

  const isValid = await verifyPassword(plainPassword, hash);
  assert.strictEqual(isValid, true, "Correct password must verify successfully");

  const isInvalid = await verifyPassword("WrongPassword123!", hash);
  assert.strictEqual(isInvalid, false, "Incorrect password must fail verification");
});

test("JWT Token Signing & Verification", async () => {
  const payload = {
    userId: "user-uuid-123456",
    role: "CANDIDATE",
    email: "candidate@skillassociate.com",
  };

  const token = await signToken(payload);
  assert.ok(typeof token === "string" && token.length > 20, "Token must be a valid JWT string");

  const decoded = await verifyToken(token);
  assert.ok(decoded !== null, "Valid token must decode successfully");
  assert.strictEqual(decoded?.userId, payload.userId);
  assert.strictEqual(decoded?.role, payload.role);
  assert.strictEqual(decoded?.email, payload.email);

  const invalidTokenResult = await verifyToken("invalid.jwt.token");
  assert.strictEqual(invalidTokenResult, null, "Invalid token must return null");
});

test("Input Validation Logic", () => {
  const validReg = validateRegistration({
    name: "Alex Morgan",
    email: "ALEX@EXAMPLE.COM",
    password: "password123",
    confirmPassword: "password123",
  });
  assert.strictEqual(validReg.isValid, true);
  assert.strictEqual(normalizeEmail("ALEX@EXAMPLE.COM "), "alex@example.com");

  const mismatchReg = validateRegistration({
    name: "Alex Morgan",
    email: "alex@example.com",
    password: "password123",
    confirmPassword: "differentPassword123",
  });
  assert.strictEqual(mismatchReg.isValid, false);
  assert.ok(mismatchReg.errors.confirmPassword);

  const weakPasswordReg = validateRegistration({
    name: "Alex Morgan",
    email: "alex@example.com",
    password: "short",
    confirmPassword: "short",
  });
  assert.strictEqual(weakPasswordReg.isValid, false);
  assert.ok(weakPasswordReg.errors.password);

  const invalidLogin = validateLogin({ email: "", password: "" });
  assert.strictEqual(invalidLogin.isValid, false);
  assert.ok(invalidLogin.errors.email);
  assert.ok(invalidLogin.errors.password);
});

test("Role Authorization Helpers", () => {
  assert.strictEqual(hasRole("CANDIDATE", ["CANDIDATE", "INSTITUTE_ADMIN"]), true);
  assert.strictEqual(hasRole("INSTITUTE_ADMIN", ["CANDIDATE"]), false);
  assert.strictEqual(hasRole("SUPER_ADMIN", ["INSTITUTE_ADMIN", "SUPER_ADMIN"]), true);
});
