import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { verifyAndDecodeSession } from "@/lib/session";

/**
 * POST /api/spotify/playlist — Create a shared playlist from listening history
 * Uses Spotify API to create a playlist from the user's radio history
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = rateLimit(`create-playlist:${ip}`, 5);
    if (!rl.success) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: rateLimitHeaders(rl) });
    }

    const auth = await getAuthenticatedUser(request);
    if ("error" in auth) return auth.error;

    // Get the dynamic access token from the session cookie
    const cookie = request.cookies.get("spotify_session")?.value;
    if (!cookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyAndDecodeSession(cookie);
    const accessToken = session?.accessToken;

    if (!accessToken) {
        return NextResponse.json({ error: "No Spotify access token" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, trackUris } = body;

        if (!name || !trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
            return NextResponse.json({ error: "Name and trackUris required" }, { status: 400 });
        }

        const spotifyId = auth.user.spotifyId;

        // 1. Create the playlist
        const createRes = await fetch(`https://api.spotify.com/v1/users/${spotifyId}/playlists`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                description: `Gemaakt door Spotify Radio 🎵`,
                public: false,
            }),
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            console.error("Playlist creation failed:", errText);
            return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
        }

        const playlist = await createRes.json();

        // 2. Add tracks to the playlist (max 100 at a time)
        const uris = trackUris.slice(0, 100); // Limit to 100 tracks
        const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris }),
        });

        if (!addRes.ok) {
            console.error("Failed to add tracks:", await addRes.text());
        }

        return NextResponse.json({
            success: true,
            playlistId: playlist.id,
            playlistUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
            trackCount: uris.length,
        });
    } catch (error) {
        console.error("Playlist error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
