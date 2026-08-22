import test from "node:test";
import assert from "node:assert";
import { validateRegistration, validateLogin } from "../lib/validation/auth";

test("Auth UI Registration Validation Schema", () => {
  const fullValidation = validateRegistration({
    name: "Candidate User",
    email: "candidate@university.edu",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(fullValidation.isValid, true);
  assert.strictEqual(Object.keys(fullValidation.errors).length, 0);

  const missingNameValidation = validateRegistration({
    name: "",
    email: "candidate@university.edu",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(missingNameValidation.isValid, false);
  assert.ok(missingNameValidation.errors.name);
});

test("Auth UI Login Validation Schema", () => {
  const validLogin = validateLogin({
    email: "user@domain.com",
    password: "ValidPassword123",
  });

  assert.strictEqual(validLogin.isValid, true);

  const emptyLogin = validateLogin({
    email: "",
    password: "",
  });

  assert.strictEqual(emptyLogin.isValid, false);
  assert.ok(emptyLogin.errors.email);
  assert.ok(emptyLogin.errors.password);
});
