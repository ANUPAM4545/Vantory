import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function logoutUser() {
  const session = await getSession();

  if (session?.userId) {
    try {
      await db.activityLog.create({
        data: {
          userId: session.userId,
          type: "USER_LOGOUT",
          title: "Signed Out",
          detail: "Session terminated.",
        },
      });
    } catch {
      // Swallowed silently so logout cookie deletion is never blocked by database errors
    }
  }

  await clearSessionCookie();
  return { success: true };
}
