import { getSession } from "./session";
import { db } from "@/lib/db";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  profile?: {
    id: string;
    headline: string | null;
    avatarUrl: string | null;
    completionScore: number;
  } | null;
}

/**
 * Returns the currently authenticated user with initialized profile metrics, or null.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            headline: true,
            avatarUrl: true,
            completionScore: true,
          },
        },
      },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Ensures user is authenticated; throws Error or redirects if unauthenticated.
 */
export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized access. Please sign in.");
  }
  return user;
}

/**
 * Ensures user is an authenticated Candidate.
 */
export async function requireCandidate(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "CANDIDATE") {
    throw new Error("Forbidden. Candidate access required.");
  }
  return user;
}

/**
 * Ensures user is an authenticated Institute Administrator.
 */
export async function requireInstituteAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "INSTITUTE_ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden. Institute Administrator access required.");
  }
  return user;
}

/**
 * Checks if a given role matches required role expectations.
 */
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
