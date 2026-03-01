import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for lyrics (24h TTL)
const lyricsCache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (getRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const trackName = searchParams.get("track");
  const artistName = searchParams.get("artist");
  const duration = searchParams.get("duration");

  if (!trackName || !artistName) {
    return NextResponse.json(
      { error: "Missing track or artist parameter" },
      { status: 400 }
    );
  }

  // Check cache
  const cacheKey = `${trackName}|${artistName}`.toLowerCase();
  const cached = lyricsCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json(cached.data);
  }

  try {
    // Build LRCLIB URL
    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });
    if (duration) {
      params.set("duration", duration);
    }

    const lrclibUrl = `https://lrclib.net/api/get?${params.toString()}`;

    const response = await fetch(lrclibUrl, {
      headers: {
        "User-Agent": "SpotifyRadio/1.0 (https://github.com/spotify-radio)",
      },
    });

    if (!response.ok) {
      // Try search endpoint as fallback
      const searchParams = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName,
      });
      const searchUrl = `https://lrclib.net/api/search?${searchParams.toString()}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          "User-Agent": "SpotifyRadio/1.0 (https://github.com/spotify-radio)",
        },
      });

      if (!searchResponse.ok) {
        return NextResponse.json({ syncedLyrics: null });
      }

      const searchResults = await searchResponse.json();
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        // Use the first result with synced lyrics
        const withSynced = searchResults.find((r: { syncedLyrics?: string }) => r.syncedLyrics);
        if (withSynced) {
          const data = { syncedLyrics: withSynced.syncedLyrics, plainLyrics: withSynced.plainLyrics };
          lyricsCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
          return NextResponse.json(data);
        }
      }

      return NextResponse.json({ syncedLyrics: null });
    }

    const data = await response.json();
    const result = {
      syncedLyrics: data.syncedLyrics || null,
      plainLyrics: data.plainLyrics || null,
    };

    // Cache successful results
    lyricsCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lyrics fetch error:", error);
    return NextResponse.json({ syncedLyrics: null });
  }
}
