import crypto from "crypto";
import { cookies } from "next/headers";

interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

/**
 * Verify and decode the session cookie. Used by API routes
 * to identify the current user.
 */
export function verifyAndDecodeSession(cookieValue: string): SessionData | null {
  try {
    const [sessionBase64, hmac] = cookieValue.split(".");
    if (!sessionBase64 || !hmac) return null;

    const expectedHmac = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
      .update(sessionBase64)
      .digest("hex");

    if (hmac !== expectedHmac) return null;

    const sessionJson = Buffer.from(sessionBase64, "base64").toString("utf-8");
    return JSON.parse(sessionJson);
  } catch {
    return null;
  }
}

/**
 * Create a signed session cookie value.
 */
export function signSession(sessionData: SessionData): string {
  const sessionJson = JSON.stringify(sessionData);
  const sessionBase64 = Buffer.from(sessionJson).toString("base64");
  const hmac = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(sessionBase64)
    .digest("hex");
  return `${sessionBase64}.${hmac}`;
}

/**
 * Get the current authenticated user's Spotify ID from the session cookie.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("spotify_session")?.value;
  if (!cookie) return null;

  const session = verifyAndDecodeSession(cookie);
  return session?.user?.id ?? null;
}

/**
 * Get the full session data from the cookie.
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("spotify_session")?.value;
  if (!cookie) return null;

  return verifyAndDecodeSession(cookie);
}
