import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { normalizeEmail, validateRegistration, type RegisterInput } from "@/lib/validation/auth";
import type { Role } from "@prisma/client";

export async function registerUser(input: RegisterInput) {
  // 1. Server-side validation
  const validation = validateRegistration(input);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0] || "Invalid registration input.");
  }

  const normalizedEmail = normalizeEmail(input.email!);
  const targetRole = (input.role || "CANDIDATE") as Role;

  // 2. Check for duplicate email
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  // 3. Hash password using bcryptjs
  const passwordHash = await hashPassword(input.password!);

  // 4. Create User & initialized role entity in database transaction
  const { user, redirectUrl } = await db.$transaction(async (tx) => {
    let userName = (input.name || "").trim();
    let destination = "/dashboard";

    if (targetRole === "COMPANY_ADMIN") {
      userName = (input.companyName || "").trim();
      destination = "/company/dashboard";
    } else if (targetRole === "INSTITUTE_ADMIN") {
      userName = (input.instituteName || "").trim();
      destination = "/institute/dashboard";
    }

    const newUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: userName,
        role: targetRole,
      },
    });

    if (targetRole === "COMPANY_ADMIN") {
      await tx.companyProfile.create({
        data: {
          userId: newUser.id,
          companyName: userName,
        },
      });
    } else if (targetRole === "INSTITUTE_ADMIN") {
      const inst = await tx.institute.create({
        data: {
          name: userName,
          contactPhone: input.phone || null,
        },
      });
      await tx.user.update({
        where: { id: newUser.id },
        data: { instituteId: inst.id },
      });
    } else {
      // Candidate
      await tx.profile.create({
        data: {
          userId: newUser.id,
          headline: "Candidate",
          phone: input.phone || null,
          education: input.college || null,
          completionScore: 25,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: newUser.id,
        type: "USER_REGISTERED",
        title: "Account Created",
        detail: `Registered as ${targetRole} on SkillAssociate.`,
      },
    });

    return { user: newUser, redirectUrl: destination };
  });

  // 5. Issue session cookie
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  // 6. Return safe user data
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    redirectUrl,
  };
}

// Retain export alias for backwards compatibility
export const registerCandidateUser = registerUser;
