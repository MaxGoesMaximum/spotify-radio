import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * GET /api/user/activity — returns recent listening activity from all users
 * Used to power the social/community page.
 */
export async function GET(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = rateLimit(`user-activity:${ip}`, 30);
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: rateLimitHeaders(rl) }
        );
    }

    const auth = await getAuthenticatedUser(request);
    if ("error" in auth) return auth.error;

    try {
        // Fetch recent listening history across all users (last 30 min)
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

        const recentActivity = await prisma.listeningHistory.findMany({
            where: {
                playedAt: { gte: thirtyMinAgo },
            },
            orderBy: { playedAt: "desc" },
            take: 20,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Get unique active user count
        const activeCount = await prisma.listeningHistory.groupBy({
            by: ["userId"],
            where: { playedAt: { gte: thirtyMinAgo } },
        });

        // Get Top Stations Leaderboard (Global, last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const topStationsGlobal = await prisma.listeningHistory.groupBy({
            by: ["genre"],
            where: { playedAt: { gte: sevenDaysAgo } },
            _count: { genre: true },
            orderBy: { _count: { genre: "desc" } },
            take: 5,
        });

        return NextResponse.json({
            activity: recentActivity.map((entry) => ({
                id: entry.id,
                user: {
                    name: entry.user.name,
                    image: entry.user.image,
                    initials: entry.user.name?.[0]?.toUpperCase() || "?",
                },
                trackName: entry.trackName,
                artistName: entry.artistName,
                station: entry.genre || "pop",
                playedAt: entry.playedAt.toISOString(),
                minutesAgo: Math.floor(
                    (Date.now() - entry.playedAt.getTime()) / 60000
                ),
            })),
            onlineCount: activeCount.length,
            topStations: topStationsGlobal.map((s) => ({
                station: s.genre,
                count: s._count.genre,
            })),
        });
    } catch (error) {
        console.error("Activity fetch error:", error);
        return NextResponse.json({ activity: [], onlineCount: 0, topStations: [] });
    }
}
