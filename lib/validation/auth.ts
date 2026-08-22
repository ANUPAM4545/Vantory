export interface RegisterInput {
  role?: "CANDIDATE" | "COMPANY_ADMIN" | "INSTITUTE_ADMIN" | string;
  name?: string;
  companyName?: string;
  instituteName?: string;
  email?: string;
  phone?: string;
  college?: string;
  password?: string;
  confirmPassword?: string;
}

export interface LoginInput {
  email?: string;
  password?: string;
  expectedRole?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Validates multi-role registration inputs server-side.
 */
export function validateRegistration(input: RegisterInput): ValidationResult {
  const errors: Record<string, string> = {};
  const targetRole = input.role || "CANDIDATE";

  if (targetRole === "COMPANY_ADMIN") {
    if (!input.companyName || input.companyName.trim().length < 2) {
      errors.companyName = "Company name must be at least 2 characters.";
    }
  } else if (targetRole === "INSTITUTE_ADMIN") {
    if (!input.instituteName || input.instituteName.trim().length < 2) {
      errors.instituteName = "Institute name must be at least 2 characters.";
    }
  } else {
    // Default Candidate
    if (!input.name || input.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters.";
    }
  }

  const normalizedEmail = normalizeEmail(input.email || "");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.password || input.password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates login input parameters.
 */
export function validateLogin(input: LoginInput): ValidationResult {
  const errors: Record<string, string> = {};

  const normalizedEmail = normalizeEmail(input.email || "");
  if (!normalizedEmail) {
    errors.email = "Email address is required.";
  }

  if (!input.password) {
    errors.password = "Password is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
