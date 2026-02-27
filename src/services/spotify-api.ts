import type { SpotifyTrack } from "@/types";
import type { StationId } from "@/config/stations";
import { STATIONS } from "@/config/stations";

type Genre = StationId;

const SPOTIFY_API = "https://api.spotify.com/v1";

export async function searchTracks(
  accessToken: string,
  genre: Genre,
  limit: number = 20
): Promise<SpotifyTrack[]> {
  const genreConfig = STATIONS.find((g) => g.id === genre);
  if (!genreConfig) return [];

  // Pick a random search term from the genre config
  const searchTerm =
    genreConfig.searchTerms[
    Math.floor(Math.random() * genreConfig.searchTerms.length)
    ];

  // Add randomization with offset and year ranges
  const currentYear = new Date().getFullYear();
  const yearStart = genre === "dutch" ? 1990 : 2000;
  const randomYear =
    Math.floor(Math.random() * (currentYear - yearStart)) + yearStart;
  const offset = Math.floor(Math.random() * 50);

  const query =
    genre === "dutch"
      ? `${searchTerm}`
      : `genre:${searchTerm} year:${randomYear}-${currentYear}`;

  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: limit.toString(),
    offset: offset.toString(),
    market: "NL",
  });

  const response = await fetch(`${SPOTIFY_API}/search?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error("Spotify search failed:", response.status);
    return [];
  }

  const data = await response.json();
  const tracks: SpotifyTrack[] = (data.tracks?.items || [])
    .filter((t: any) => t.uri && t.name)
    .map((t: any) => mapSpotifyTrack(t));

  // Shuffle results for variety
  return shuffleArray(tracks);
}

export async function playTrack(
  accessToken: string,
  deviceId: string,
  trackUri: string
): Promise<boolean> {
  const response = await fetch(
    `${SPOTIFY_API}/me/player/play?device_id=${deviceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    }
  );

  return response.ok || response.status === 204;
}

export async function setVolume(
  accessToken: string,
  deviceId: string,
  volumePercent: number
): Promise<void> {
  await fetch(
    `${SPOTIFY_API}/me/player/volume?volume_percent=${Math.round(
      volumePercent
    )}&device_id=${deviceId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

export async function pausePlayback(accessToken: string): Promise<void> {
  await fetch(`${SPOTIFY_API}/me/player/pause`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function resumePlayback(
  accessToken: string,
  deviceId: string
): Promise<void> {
  await fetch(`${SPOTIFY_API}/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function saveTrack(
  accessToken: string,
  trackId: string
): Promise<boolean> {
  const response = await fetch(`${SPOTIFY_API}/me/tracks`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: [trackId] }),
  });
  return response.ok;
}

export async function removeTrack(
  accessToken: string,
  trackId: string
): Promise<boolean> {
  const response = await fetch(`${SPOTIFY_API}/me/tracks`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: [trackId] }),
  });
  return response.ok;
}

export async function checkSavedTracks(
  accessToken: string,
  trackIds: string[]
): Promise<boolean[]> {
  const ids = trackIds.join(",");
  const response = await fetch(
    `${SPOTIFY_API}/me/tracks/contains?ids=${ids}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) return trackIds.map(() => false);
  return response.json();
}

// ── Map raw Spotify API response to SpotifyTrack ──────────

export function mapSpotifyTrack(t: any): SpotifyTrack {
  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((a: any) => ({ id: a.id, name: a.name })),
    album: {
      id: t.album.id,
      name: t.album.name,
      images: t.album.images,
      release_date: t.album.release_date,
    },
    duration_ms: t.duration_ms,
    uri: t.uri,
    preview_url: t.preview_url,
    popularity: t.popularity ?? 0,
  };
}

export async function getRecommendations(
  accessToken: string,
  options: {
    seed_genres?: string;
    seed_tracks?: string;
    seed_artists?: string;
    target_energy?: number;
    target_valence?: number;
    min_popularity?: number;
    limit?: number;
  }
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    limit: (options.limit || 20).toString(),
    market: "NL"
  });
  if (options.seed_genres) params.append("seed_genres", options.seed_genres);
  if (options.seed_tracks) params.append("seed_tracks", options.seed_tracks);
  if (options.seed_artists) params.append("seed_artists", options.seed_artists);
  if (options.target_energy !== undefined) params.append("target_energy", options.target_energy.toString());
  if (options.target_valence !== undefined) params.append("target_valence", options.target_valence.toString());
  if (options.min_popularity !== undefined) params.append("min_popularity", options.min_popularity.toString());

  const response = await fetch(`${SPOTIFY_API}/recommendations?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error("Spotify recommendations failed:", response.status);
    return [];
  }

  const data = await response.json();
  const tracks: SpotifyTrack[] = (data.tracks || [])
    .filter((t: any) => t.uri && t.name)
    .map((t: any) => mapSpotifyTrack(t));

  return tracks;
}

// ── Multi-query parallel search ───────────────────────────

export async function searchTracksMulti(
  accessToken: string,
  queries: string[],
  limit: number = 15
): Promise<SpotifyTrack[]> {
  const results = await Promise.all(
    queries.map(async (query) => {
      const offset = Math.floor(Math.random() * 20);
      const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: limit.toString(),
        offset: offset.toString(),
        market: "NL",
      });

      try {
        const response = await fetch(`${SPOTIFY_API}/search?${params}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) return [];

        const data = await response.json();
        return (data.tracks?.items || [])
          .filter((t: any) => t.uri && t.name && t.duration_ms > 30000)
          .map((t: any) => mapSpotifyTrack(t));
      } catch {
        return [];
      }
    })
  );

  // Merge and deduplicate by track ID
  const seen = new Set<string>();
  const merged: SpotifyTrack[] = [];
  for (const batch of results) {
    for (const track of batch) {
      if (!seen.has(track.id)) {
        seen.add(track.id);
        merged.push(track);
      }
    }
  }

  return merged;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
