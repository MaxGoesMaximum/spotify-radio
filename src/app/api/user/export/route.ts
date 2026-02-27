import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * GET /api/user/export — GDPR data export
 * Returns all user data as JSON download
 */
export async function GET(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = rateLimit(`user-export:${ip}`, 5); // 5 requests per window
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: rateLimitHeaders(rl) }
        );
    }

    const auth = await getAuthenticatedUser(request);
    if ("error" in auth) return auth.error;

    try {
        const user = await prisma.user.findUnique({
            where: { id: auth.user.id },
            include: {
                preferences: true,
                listeningHistory: {
                    orderBy: { playedAt: "desc" },
                    take: 1000,
                },
                favorites: {
                    orderBy: { savedAt: "desc" },
                },
                sessions: {
                    select: {
                        id: true,
                        createdAt: true,
                        expiresAt: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            format: "GDPR Data Export - Spotify Radio",
            user: {
                id: user.id,
                spotifyId: user.spotifyId,
                name: user.name,
                email: user.email,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            preferences: user.preferences,
            listeningHistory: user.listeningHistory.map((h) => ({
                trackName: h.trackName,
                artistName: h.artistName,
                albumName: h.albumName,
                genre: h.genre,
                playedAt: h.playedAt,
                durationMs: h.durationMs,
            })),
            favorites: user.favorites.map((f) => ({
                trackName: f.trackName,
                artistName: f.artistName,
                albumName: f.albumName,
                savedAt: f.savedAt,
            })),
            sessions: user.sessions.map((s) => ({
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
            })),
        };

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="spotify-radio-data-${user.spotifyId}.json"`,
            },
        });
    } catch (error) {
        console.error("Data export error:", error);
        return NextResponse.json(
            { error: "Export failed" },
            { status: 500 }
        );
    }
}
