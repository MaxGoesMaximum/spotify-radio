import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/radio", "/explore", "/profile", "/stats", "/social"];

/**
 * Lightweight session check for Edge Runtime.
 * Only verifies cookie structure (base64.hmac format).
 * Full HMAC verification happens in API routes (Node.js runtime).
 */
function hasValidSessionFormat(cookieValue: string): boolean {
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return false;

    const [sessionBase64, hmac] = parts;
    if (!sessionBase64 || !hmac) return false;

    // Verify it's valid base64 that decodes to JSON
    const decoded = atob(sessionBase64);
    const parsed = JSON.parse(decoded);
    return !!(parsed.accessToken && parsed.user?.id);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("spotify_session")?.value;

  if (!sessionCookie || !hasValidSessionFormat(sessionCookie)) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add security headers for protected routes
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: [
    "/radio/:path*",
    "/explore/:path*",
    "/profile/:path*",
    "/stats/:path*",
    "/social/:path*",
  ],
};
