import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAndDecodeSession } from "@/lib/session";

/**
 * Get the authenticated database user from the request cookie.
 * Returns the user or a 401 response.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const cookie = request.cookies.get("spotify_session")?.value;
  if (!cookie) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const session = verifyAndDecodeSession(cookie);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { spotifyId: session.user.id },
  });

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user };
}
