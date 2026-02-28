import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function getBaseUrl(request: NextRequest): string {
  // Use NEXTAUTH_URL or NEXT_PUBLIC_BASE_URL env var for production
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  // Fallback to request host for development
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const BASE_URL = getBaseUrl(request);
  const REDIRECT_URI = `${BASE_URL}/api/spotify/callback`;

  // If accessed via localhost, redirect to 127.0.0.1 first
  // so the state cookie is set on the same domain as the callback
  const host = request.headers.get("host") || "";
  if (host.includes("localhost") && !process.env.NEXT_PUBLIC_BASE_URL) {
    return NextResponse.redirect(`http://127.0.0.1:3000/api/spotify/login`);
  }

  const state = crypto.randomBytes(16).toString("hex");

  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-library-modify",
    "user-library-read",
    "playlist-modify-private",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params}`
  );

  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
