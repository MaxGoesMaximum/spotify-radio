import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`user-stats:${ip}`, 30);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const userId = auth.user.id;

  // Run queries in parallel
  const [
    totalTracks,
    totalFavorites,
    totalDurationResult,
    genreStats,
    topArtists,
    recentDays,
    memberSince,
    topTracks,
  ] = await Promise.all([
    // Total tracks played
    prisma.listeningHistory.count({ where: { userId } }),

    // Total favorites
    prisma.favorite.count({ where: { userId } }),

    // Total listening duration
    prisma.listeningHistory.aggregate({
      where: { userId },
      _sum: { durationMs: true },
    }),

    // Top genres
    prisma.listeningHistory.groupBy({
      by: ["genre"],
      where: { userId },
      _count: { genre: true },
      orderBy: { _count: { genre: "desc" } },
      take: 5,
    }),

    // Top artists (by play count)
    prisma.listeningHistory.groupBy({
      by: ["artistName"],
      where: { userId },
      _count: { artistName: true },
      orderBy: { _count: { artistName: "desc" } },
      take: 10,
    }),

    // Unique listening days (last 30 days)
    prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { playedAt: true },
      distinct: ["playedAt"],
    }),

    // Member since
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    }),

    // Top tracks (by play count)
    prisma.listeningHistory.groupBy({
      by: ["trackId", "trackName", "artistName", "albumImage"],
      where: { userId },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 10,
    }),
  ]);

  // Calculate listening streak
  const uniqueDays = new Set(
    recentDays.map((d) => d.playedAt.toISOString().split("T")[0])
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split("T")[0];
    if (uniqueDays.has(dayStr)) {
      streak++;
    } else if (i > 0) {
      break; // Streak broken
    }
  }

  const totalMinutes = Math.round(
    (totalDurationResult._sum.durationMs || 0) / 60000
  );

  return NextResponse.json({
    stats: {
      totalTracks,
      totalFavorites,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      topGenres: genreStats.map((g) => ({
        genre: g.genre,
        count: g._count.genre,
      })),
      topArtists: topArtists.map((a) => ({
        artist: a.artistName,
        count: a._count.artistName,
      })),
      topTracks: topTracks.map((t) => ({
        id: t.trackId,
        title: t.trackName,
        artist: t.artistName,
        albumArt: t.albumImage,
        count: t._count.trackId,
      })),
      listeningStreak: streak,
      activeDaysLast30: uniqueDays.size,
      memberSince: memberSince?.createdAt?.toISOString() || null,
    },
  });
}
