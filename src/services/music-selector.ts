// ═══════════════════════════════════════════════════════════════
//  MUSIC SELECTION ENGINE — Smart rotation, audio-feature-aware,
//  mood arcs, genre-seed fallback, taste-aware
// ═══════════════════════════════════════════════════════════════

import type { SpotifyTrack } from "@/types";
import type { StationId, StationConfig } from "@/config/stations";
import { getStation } from "@/config/stations";
import { searchTracksMulti } from "./spotify-api";

// ── Rotation Categories ─────────────────────────────────────

type RotationSlot = "C" | "R" | "G"; // Current, Recurrent, Gold

const ROTATION_CLOCK: RotationSlot[] = [
  "C", "C", "R", "G", "C", "R", "C", "G", "C", "C", "R", "G",
];

// ── Mood Arc Curves ─────────────────────────────────────────
// These define how energy/valence should evolve throughout each
// time period. Each gives a smooth target based on the fractional
// progress through the period (0 = start, 1 = end of period).

interface MoodPoint {
  energy: number;
  valence: number;
  danceability: number;
}

function getMoodTarget(): MoodPoint {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const fractionalHour = hour + minute / 60;

  // Morning (6–12): gentle ramp from calm to energetic
  if (hour >= 6 && hour < 12) {
    const t = (fractionalHour - 6) / 6; // 0 at 6am, 1 at noon
    return {
      energy: 0.45 + t * 0.30, // 0.45 → 0.75
      valence: 0.50 + t * 0.20, // 0.50 → 0.70
      danceability: 0.40 + t * 0.25, // 0.40 → 0.65
    };
  }

  // Afternoon (12–18): plateau with a slight peak
  if (hour >= 12 && hour < 18) {
    const t = (fractionalHour - 12) / 6;
    const peak = Math.sin(t * Math.PI); // peaks at 3pm
    return {
      energy: 0.65 + peak * 0.10, // 0.65 → 0.75 → 0.65
      valence: 0.65 + peak * 0.10, // 0.65 → 0.75 → 0.65
      danceability: 0.60 + peak * 0.10, // 0.60 → 0.70 → 0.60
    };
  }

  // Evening (18–23): graceful decline
  if (hour >= 18 && hour < 23) {
    const t = (fractionalHour - 18) / 5; // 0 at 6pm, 1 at 11pm
    return {
      energy: 0.65 - t * 0.25, // 0.65 → 0.40
      valence: 0.60 - t * 0.15, // 0.60 → 0.45
      danceability: 0.55 - t * 0.20, // 0.55 → 0.35
    };
  }

  // Night (23–6): low and steady
  return {
    energy: 0.35,
    valence: 0.40,
    danceability: 0.30,
  };
}

// ── Selection State ─────────────────────────────────────────

interface TasteProfile {
  likedArtistIds: string[];
  skippedArtistIds: string[];
  likedGenreBoosts: Record<string, number>;
  lastUpdated: number;
}

interface SelectionState {
  playedTrackIds: Set<string>;
  recentArtistIds: string[];   // Circular buffer, last N
  artistPlayCounts: Map<string, number>;
  rotationPosition: number;
  tasteProfile: TasteProfile;
  candidatePool: SpotifyTrack[]; // Pre-fetched candidates
  lastFetchStation: StationId | null;
}

const MAX_RECENT_ARTISTS = 6;
const MAX_TASTE_ARTISTS = 80;
const TASTE_STORAGE_KEY = "spotify-radio-taste";

// ── Singleton State ─────────────────────────────────────────

let state: SelectionState = {
  playedTrackIds: new Set(),
  recentArtistIds: [],
  artistPlayCounts: new Map(),
  rotationPosition: 0,
  tasteProfile: loadTasteProfile(),
  candidatePool: [],
  lastFetchStation: null,
};

// ── Taste Profile Persistence ───────────────────────────────

function loadTasteProfile(): TasteProfile {
  try {
    const stored = localStorage.getItem(TASTE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        likedArtistIds: parsed.likedArtistIds || [],
        skippedArtistIds: parsed.skippedArtistIds || [],
        likedGenreBoosts: parsed.likedGenreBoosts || {},
        lastUpdated: parsed.lastUpdated || Date.now(),
      };
    }
  } catch { }
  return {
    likedArtistIds: [],
    skippedArtistIds: [],
    likedGenreBoosts: {},
    lastUpdated: Date.now(),
  };
}

function saveTasteProfile(profile: TasteProfile) {
  try {
    localStorage.setItem(TASTE_STORAGE_KEY, JSON.stringify(profile));
  } catch { }
}

// ── Public API ──────────────────────────────────────────────

export function updateTasteProfile(
  action: "like" | "skip",
  track: SpotifyTrack
) {
  const profile = state.tasteProfile;
  const artistIds = track.artists.map((a) => a.id);

  if (action === "like") {
    for (const id of artistIds) {
      if (!profile.likedArtistIds.includes(id)) {
        profile.likedArtistIds.push(id);
        if (profile.likedArtistIds.length > MAX_TASTE_ARTISTS) {
          profile.likedArtistIds.shift();
        }
      }
      // Remove from skipped if they liked it
      profile.skippedArtistIds = profile.skippedArtistIds.filter(
        (sid) => sid !== id
      );
    }
  } else {
    for (const id of artistIds) {
      if (!profile.skippedArtistIds.includes(id)) {
        profile.skippedArtistIds.push(id);
        if (profile.skippedArtistIds.length > MAX_TASTE_ARTISTS) {
          profile.skippedArtistIds.shift();
        }
      }
    }
  }

  profile.lastUpdated = Date.now();
  saveTasteProfile(profile);
}

export function resetSelectionState() {
  state = {
    playedTrackIds: new Set(),
    recentArtistIds: [],
    artistPlayCounts: new Map(),
    rotationPosition: 0,
    tasteProfile: loadTasteProfile(),
    candidatePool: [],
    lastFetchStation: null,
  };
}

export function clearCandidatePool() {
  state.candidatePool = [];
  state.lastFetchStation = null;
}

// ── Main Selection Function ─────────────────────────────────

export async function selectNextTrack(
  stationId: StationId,
  accessToken: string
): Promise<SpotifyTrack | null> {
  const station = getStation(stationId);

  // If station changed, clear candidate pool
  if (state.lastFetchStation !== stationId) {
    state.candidatePool = [];
    state.lastFetchStation = stationId;
  }

  // Refill candidate pool if running low
  if (state.candidatePool.length < 5) {
    const newCandidates = await fetchCandidates(station, accessToken);
    state.candidatePool.push(...newCandidates);
  }

  // Filter out already-played tracks and recent artists
  const eligible = state.candidatePool.filter((track) => {
    if (state.playedTrackIds.has(track.id)) return false;
    const artistIds = track.artists.map((a) => a.id);
    if (artistIds.some((id) => state.recentArtistIds.includes(id))) return false;
    // Filter tracks that are too short (<60s) or too long (>10min)
    if (track.duration_ms < 60000 || track.duration_ms > 600000) return false;
    return true;
  });

  if (eligible.length === 0) {
    // Fallback: relax artist filter, just avoid exact track repeats
    const relaxed = state.candidatePool.filter(
      (t) => !state.playedTrackIds.has(t.id)
    );
    if (relaxed.length === 0) {
      // Last resort: refetch entirely
      state.candidatePool = [];
      const fresh = await fetchCandidates(station, accessToken);
      if (fresh.length === 0) return null;
      return pickAndRecord(fresh[0]);
    }
    return pickAndRecord(scoreTracks(relaxed, station)[0]);
  }

  // Score and pick best track
  const scored = scoreTracks(eligible, station);
  return pickAndRecord(scored[0]);
}

// ── Internal Functions ──────────────────────────────────────

function pickAndRecord(track: SpotifyTrack): SpotifyTrack {
  // Record this track
  state.playedTrackIds.add(track.id);

  // Update recent artists (circular buffer)
  for (const artist of track.artists) {
    state.recentArtistIds.push(artist.id);
    if (state.recentArtistIds.length > MAX_RECENT_ARTISTS) {
      state.recentArtistIds.shift();
    }
    // Increment play count
    const count = state.artistPlayCounts.get(artist.id) || 0;
    state.artistPlayCounts.set(artist.id, count + 1);
  }



  // Advance rotation
  state.rotationPosition =
    (state.rotationPosition + 1) % ROTATION_CLOCK.length;

  // Remove this track from candidate pool
  state.candidatePool = state.candidatePool.filter((t) => t.id !== track.id);

  return track;
}

function scoreTracks(
  tracks: SpotifyTrack[],
  station: StationConfig
): SpotifyTrack[] {
  const profile = state.tasteProfile;

  const scored = tracks.map((track) => {
    let score = 0;

    // Base: Spotify popularity (0–100 → 0–1)
    const pop = track.popularity ?? 50;
    score += pop / 100;

    // Rotation slot bonus: favor tracks matching current rotation category
    const slot = ROTATION_CLOCK[state.rotationPosition % ROTATION_CLOCK.length];
    const releaseYear = getReleaseYear(track);
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    if (slot === "C" && age <= 2 && pop >= 60) score += 0.3;
    else if (slot === "R" && age > 2 && age <= 8 && pop >= 40) score += 0.25;
    else if (slot === "G" && age > 8) score += 0.2;



    // Taste bonus: liked artists
    const artistIds = track.artists.map((a) => a.id);
    if (artistIds.some((id) => profile.likedArtistIds.includes(id))) {
      score += 0.2;
    }

    // Taste penalty: skipped artists
    if (artistIds.some((id) => profile.skippedArtistIds.includes(id))) {
      score -= 0.3;
    }

    // Artist frequency penalty (diminishing returns)
    for (const artist of track.artists) {
      const playCount = state.artistPlayCounts.get(artist.id) || 0;
      if (playCount > 0) {
        score -= Math.min(0.4, playCount * 0.1);
      }
    }

    // Popularity range bonus: tracks within station's preferred range get a boost
    if (
      pop >= station.popularityRange.min &&
      pop <= station.popularityRange.max
    ) {
      score += 0.1;
    }

    // Random factor for variety (reduced compared to before since we now score more intentionally)
    score += (Math.random() - 0.5) * 0.12;

    return { track, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.track);
}

async function fetchCandidates(
  station: StationConfig,
  accessToken: string
): Promise<SpotifyTrack[]> {
  // ── Primary strategy: Search (always available) ──
  const slot = ROTATION_CLOCK[state.rotationPosition % ROTATION_CLOCK.length];
  const queries = buildSearchQueries(station, slot);
  const searchResults = await searchTracksMulti(accessToken, queries, 15);
  const filteredSearch = searchResults.filter(
    (t) => (t.popularity ?? 50) >= Math.max(0, station.popularityRange.min - 15)
  );

  return filteredSearch;
}



function buildSearchQueries(
  station: StationConfig,
  slot: RotationSlot
): string[] {
  const terms = station.searchTerms;
  const currentYear = new Date().getFullYear();
  const queries: string[] = [];

  // Pick 2-3 random terms
  const shuffled = [...terms].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  for (const term of picked) {
    const isArtistName = /^[A-Z]/.test(term) && !term.includes(" ");
    const isMultiWordName =
      term.includes(" ") &&
      !term.toLowerCase().includes("hits") &&
      !term.toLowerCase().includes("muziek") &&
      !term.toLowerCase().includes("pop") &&
      !term.toLowerCase().includes("rock") &&
      !term.toLowerCase().includes("jazz") &&
      !term.toLowerCase().includes("house") &&
      !term.toLowerCase().includes("hip hop") &&
      !term.toLowerCase().includes("chill");

    // Determine if this looks like an artist name
    const looksLikeArtist = isArtistName || isMultiWordName;

    if (looksLikeArtist) {
      // Search by artist name directly
      queries.push(`artist:${term}`);
    } else {
      // Search by genre with year range
      let yearMin: number, yearMax: number;

      switch (slot) {
        case "C":
          yearMin = currentYear - 2;
          yearMax = currentYear;
          break;
        case "R":
          yearMin = currentYear - 8;
          yearMax = currentYear - 2;
          break;
        case "G":
          yearMin = station.yearRange.min;
          yearMax = currentYear - 8;
          break;
      }

      // Ensure year range is valid
      yearMin = Math.max(yearMin, station.yearRange.min);
      yearMax = Math.min(yearMax, station.yearRange.max);
      if (yearMin > yearMax) {
        yearMin = station.yearRange.min;
        yearMax = station.yearRange.max;
      }

      queries.push(`genre:${term} year:${yearMin}-${yearMax}`);
    }
  }

  return queries;
}

function getReleaseYear(track: SpotifyTrack): number {
  const date = track.album.release_date;
  if (date) {
    const year = parseInt(date.substring(0, 4), 10);
    if (!isNaN(year)) return year;
  }
  return new Date().getFullYear(); // Default to current year
}

// ── Export state info for debugging ─────────────────────────

export function getSelectionStats() {
  return {
    playedCount: state.playedTrackIds.size,
    recentArtists: state.recentArtistIds.length,
    candidatePoolSize: state.candidatePool.length,
    rotationPosition: state.rotationPosition,
    rotationSlot:
      ROTATION_CLOCK[state.rotationPosition % ROTATION_CLOCK.length],
  };
}
