import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "skillassociate_super_secret_jwt_key_monochrome_2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface SessionJWTPayload extends JWTPayload {
  userId: string;
  role: string;
  email: string;
}

/**
 * Signs a JWT token containing minimal safe user session claims.
 */
export async function signToken(payload: {
  userId: string;
  role: string;
  email: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verifies a JWT token and returns payload if valid, or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<SessionJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as SessionJWTPayload;
  } catch {
    return null;
  }
}
