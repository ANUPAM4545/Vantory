import test from "node:test";
import assert from "node:assert";
import { validateRegistration, validateLogin } from "../lib/validation/auth";
import { hasRole } from "../lib/auth/authorization";

test("Multi-Role Candidate Validation", () => {
  const candidateReg = validateRegistration({
    role: "CANDIDATE",
    name: "Alex Morgan",
    email: "alex@university.edu",
    phone: "+1 555 000 1111",
    college: "Stanford University",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(candidateReg.isValid, true);
  assert.strictEqual(Object.keys(candidateReg.errors).length, 0);
});

test("Multi-Role Company Validation", () => {
  const companyReg = validateRegistration({
    role: "COMPANY_ADMIN",
    companyName: "Acme Corp",
    email: "hiring@acme.com",
    phone: "+1 555 222 3333",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(companyReg.isValid, true);

  const invalidCompanyReg = validateRegistration({
    role: "COMPANY_ADMIN",
    companyName: "",
    email: "hiring@acme.com",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(invalidCompanyReg.isValid, false);
  assert.ok(invalidCompanyReg.errors.companyName);
});

test("Multi-Role Institute Validation", () => {
  const instituteReg = validateRegistration({
    role: "INSTITUTE_ADMIN",
    instituteName: "MIT Institute",
    email: "admin@mit.edu",
    phone: "+1 555 444 5555",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(instituteReg.isValid, true);

  const invalidInstituteReg = validateRegistration({
    role: "INSTITUTE_ADMIN",
    instituteName: "",
    email: "admin@mit.edu",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  assert.strictEqual(invalidInstituteReg.isValid, false);
  assert.ok(invalidInstituteReg.errors.instituteName);
});

test("Multi-Role Authorization Boundaries", () => {
  // Candidate role check
  assert.strictEqual(hasRole("CANDIDATE", ["CANDIDATE"]), true);
  assert.strictEqual(hasRole("CANDIDATE", ["COMPANY_ADMIN", "INSTITUTE_ADMIN"]), false);

  // Company role check
  assert.strictEqual(hasRole("COMPANY_ADMIN", ["COMPANY_ADMIN", "SUPER_ADMIN"]), true);
  assert.strictEqual(hasRole("COMPANY_ADMIN", ["INSTITUTE_ADMIN"]), false);

  // Institute role check
  assert.strictEqual(hasRole("INSTITUTE_ADMIN", ["INSTITUTE_ADMIN", "SUPER_ADMIN"]), true);
  assert.strictEqual(hasRole("INSTITUTE_ADMIN", ["COMPANY_ADMIN"]), false);
});
