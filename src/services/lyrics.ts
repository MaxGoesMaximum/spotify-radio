// ═══════════════════════════════════════════════════════════════
//  LYRICS SERVICE — Fetch and parse synced lyrics from LRCLIB
// ═══════════════════════════════════════════════════════════════

export interface SyncedLyric {
  time: number; // seconds
  text: string;
}

/**
 * Parse LRC format into structured objects
 * LRC format: [mm:ss.xx] text
 */
export function parseLRC(lrc: string): SyncedLyric[] {
  const lines = lrc.split("\n");
  const lyrics: SyncedLyric[] = [];

  for (const line of lines) {
    // Match [mm:ss.xx] or [mm:ss] format
    const match = line.match(/^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]\s*(.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0;
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();

      // Skip empty lines and metadata tags
      if (text && !text.startsWith("[")) {
        lyrics.push({ time, text });
      }
    }
  }

  return lyrics.sort((a, b) => a.time - b.time);
}

/**
 * Fetch lyrics from our server-side proxy
 */
export async function fetchLyrics(
  trackName: string,
  artistName: string,
  durationMs?: number
): Promise<SyncedLyric[] | null> {
  try {
    const params = new URLSearchParams({
      track: trackName,
      artist: artistName,
    });
    if (durationMs) {
      params.set("duration", String(Math.round(durationMs / 1000)));
    }

    const res = await fetch(`/api/lyrics?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.syncedLyrics) return null;

    return parseLRC(data.syncedLyrics);
  } catch {
    return null;
  }
}
