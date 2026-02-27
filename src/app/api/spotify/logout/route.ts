import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAndDecodeSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get("spotify_session")?.value;

  if (cookie) {
    const session = verifyAndDecodeSession(cookie);
    if (session?.user?.id) {
      try {
        // Delete all sessions for this user
        const user = await prisma.user.findUnique({
          where: { spotifyId: session.user.id },
        });
        if (user) {
          await prisma.session.deleteMany({
            where: { userId: user.id },
          });
        }
      } catch (err) {
        console.error("Failed to clean up DB sessions:", err);
      }
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("spotify_session");
  return response;
}
