import { cookies } from "next/headers";
import { signToken, verifyToken, type SessionJWTPayload } from "./jwt";

export const COOKIE_NAME = "skillassociate_session";
export const COOKIE_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 Days

/**
 * Sets an HttpOnly, secure authentication cookie on the client response.
 */
export async function setSessionCookie(payload: {
  userId: string;
  role: string;
  email: string;
}): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_DURATION_SECONDS,
  });
}

/**
 * Clears the authentication cookie from client headers.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Retrieves and verifies the current session payload from cookies.
 */
export async function getSession(): Promise<SessionJWTPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie || !cookie.value) {
    return null;
  }

  return verifyToken(cookie.value);
}
