import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { discoveriesQuerySchema } from "@/lib/validations";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * GET /api/user/discoveries — Get recent listening history for discovery filtering
 * Returns tracks from the last N days. Client-side determines which are "new"
 * by checking against the user's Spotify library.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`discoveries:${ip}`, 20);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const parsed = discoveriesQuerySchema.safeParse({
    days: searchParams.get("days") || "7",
  });

  const days = parsed.success ? parsed.data.days : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await prisma.listeningHistory.findMany({
    where: {
      userId: auth.user.id,
      playedAt: { gte: since },
    },
    orderBy: { playedAt: "desc" },
    take: 200,
  });

  // Deduplicate by trackId, keeping the first (most recent) occurrence
  const seen = new Set<string>();
  const unique = history.filter((entry) => {
    if (seen.has(entry.trackId)) return false;
    seen.add(entry.trackId);
    return true;
  });

  return NextResponse.json({
    discoveries: unique.map((entry) => ({
      trackId: entry.trackId,
      trackName: entry.trackName,
      artistName: entry.artistName,
      albumName: entry.albumName,
      albumImage: entry.albumImage,
      genre: entry.genre,
      playedAt: entry.playedAt,
    })),
    period: { days, since: since.toISOString() },
  });
}
