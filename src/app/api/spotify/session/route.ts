import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAndDecodeSession, signSession } from "@/lib/session";

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

async function refreshAccessToken(
  session: SessionData
): Promise<SessionData | null> {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) return null;

    const refreshed: SessionData = {
      ...session,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + data.expires_in),
      refreshToken: data.refresh_token || session.refreshToken,
    };

    // Update session in database
    const user = await prisma.user.findUnique({
      where: { spotifyId: session.user.id },
    });
    if (user) {
      // Update the most recent session
      const dbSession = await prisma.session.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (dbSession) {
        await prisma.session.update({
          where: { id: dbSession.id },
          data: {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            expiresAt: refreshed.expiresAt,
          },
        });
      }
    }

    return refreshed;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("spotify_session")?.value;
  if (!cookie) {
    return NextResponse.json({ session: null });
  }

  let session = verifyAndDecodeSession(cookie);
  if (!session) {
    return NextResponse.json({ session: null });
  }

  // Check if token needs refresh (with 60s buffer)
  if (Date.now() / 1000 >= session.expiresAt - 60) {
    const refreshed = await refreshAccessToken(session);
    if (refreshed) {
      session = refreshed;

      const cookieValue = signSession(session);
      const response = NextResponse.json({
        session: {
          accessToken: session.accessToken,
          user: session.user,
        },
      });

      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set("spotify_session", cookieValue, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });

      return response;
    } else {
      const response = NextResponse.json({ session: null });
      response.cookies.delete("spotify_session");
      return response;
    }
  }

  // Load user preferences from database
  let preferences = null;
  try {
    const user = await prisma.user.findUnique({
      where: { spotifyId: session.user.id },
      include: { preferences: true },
    });
    if (user?.preferences) {
      const p = user.preferences as Record<string, unknown>;
      preferences = {
        theme: p.theme,
        volume: p.volume,
        lastStation: p.lastStation,
        djVoice: p.djVoice,
        notificationsEnabled: p.notificationsEnabled,
        djFrequency: p.djFrequency,
        crossfade: p.crossfade,
      };
    }
  } catch (err) {
    console.error("Failed to load preferences:", err);
  }

  return NextResponse.json({
    session: {
      accessToken: session.accessToken,
      user: session.user,
    },
    preferences,
  });
}
