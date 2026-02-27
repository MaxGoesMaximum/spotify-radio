import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const BASE_URL = getBaseUrl(request);
  const REDIRECT_URI = `${BASE_URL}/api/spotify/callback`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${BASE_URL}/?error=${encodeURIComponent(error)}`
    );
  }

  // Validate state (CSRF)
  const storedState = request.cookies.get("spotify_auth_state")?.value;
  if (!state || state !== storedState) {
    console.error("State mismatch:", { state, storedState });
    return NextResponse.redirect(`${BASE_URL}/?error=state_mismatch`);
  }

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokens);
      return NextResponse.redirect(
        `${BASE_URL}/?error=${tokens.error || "token_error"}`
      );
    }

    // Fetch user profile
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResponse.json();

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { spotifyId: profile.id },
      update: {
        name: profile.display_name || "Spotify User",
        email: profile.email || "",
        image: profile.images?.[0]?.url || null,
      },
      create: {
        spotifyId: profile.id,
        name: profile.display_name || "Spotify User",
        email: profile.email || "",
        image: profile.images?.[0]?.url || null,
      },
    });

    // Create session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
      },
    });

    // Ensure user has preferences
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    // Create signed session cookie
    const sessionData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
      user: {
        id: profile.id,
        name: profile.display_name || "Spotify User",
        email: profile.email || "",
        image: profile.images?.[0]?.url || null,
      },
    };

    const isProduction = process.env.NODE_ENV === "production";
    const cookieValue = signSession(sessionData);
    const response = NextResponse.redirect(`${BASE_URL}/radio`);

    response.cookies.set("spotify_session", cookieValue, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.delete("spotify_auth_state");

    return response;
  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(`${BASE_URL}/?error=server_error`);
  }
}
