import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { normalizeEmail, validateLogin, type LoginInput } from "@/lib/validation/auth";

export async function loginUser(input: LoginInput) {
  // 1. Validate input
  const validation = validateLogin(input);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0] || "Invalid email or password.");
  }

  const normalizedEmail = normalizeEmail(input.email!);

  // 2. Find user by email
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  const GENERIC_ERROR = "Invalid email or password.";

  if (!user) {
    throw new Error(GENERIC_ERROR);
  }

  // 3. Verify password hash using bcryptjs
  const isValidPassword = await verifyPassword(input.password!, user.passwordHash);
  if (!isValidPassword) {
    throw new Error(GENERIC_ERROR);
  }

  // 4. Determine redirect URL based on role
  let redirectUrl = "/dashboard";
  if (user.role === "COMPANY_ADMIN") {
    redirectUrl = "/company/dashboard";
  } else if (user.role === "INSTITUTE_ADMIN" || user.role === "SUPER_ADMIN") {
    redirectUrl = "/institute/dashboard";
  }

  // 5. Record login activity
  await db.activityLog.create({
    data: {
      userId: user.id,
      type: "USER_LOGIN",
      title: "Signed In",
      detail: `Authenticated session established as ${user.role}.`,
    },
  });

  // 6. Issue session cookie
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  // 7. Return safe user data
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    redirectUrl,
  };
}
