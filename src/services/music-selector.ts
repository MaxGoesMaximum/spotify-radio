// ═══════════════════════════════════════════════════════════════
//  MUSIC SELECTION ENGINE — Smart rotation, audio-feature-aware,
//  mood arcs, genre-seed fallback, taste-aware
// ═══════════════════════════════════════════════════════════════

import type { SpotifyTrack, CustomStationConfig, TrackScoreBreakdown, SelectionResult } from "@/types";
import type { StationId, StationConfig } from "@/config/stations";
import { getStation } from "@/config/stations";
import { searchTracksMulti } from "./spotify-api";

// ── Discovery Mode ──────────────────────────────────────────

let discoveryModeEnabled = false;

export function setDiscoveryMode(enabled: boolean) {
  discoveryModeEnabled = enabled;
  // Clear pool so next fetch uses new scoring
  state.candidatePool = [];
  state.lastFetchStation = null;
}

// ── Temporary Filter (DJ Requests) ─────────────────────────

export interface TemporaryFilter {
  yearRange?: { min: number; max: number };
  genreBoost?: string[];
  energyRange?: { min: number; max: number };
  artistSearch?: string;
  expiresAfterTracks: number;
  tracksPlayed: number;
}

let activeFilter: TemporaryFilter | null = null;

export function setTemporaryFilter(filter: Omit<TemporaryFilter, "tracksPlayed">) {
  activeFilter = { ...filter, tracksPlayed: 0 };
  // Clear pool so next fetch respects the new filter
  state.candidatePool = [];
  state.lastFetchStation = null;
}

export function clearTemporaryFilter() {
  activeFilter = null;
  state.candidatePool = [];
  state.lastFetchStation = null;
}

export function getActiveFilter(): TemporaryFilter | null {
  return activeFilter;
}

// ── Time Machine (decade override) ─────────────────────────

let timeMachineDecade: number | null = null;

export function setTimeMachineDecade(decade: number | null) {
  timeMachineDecade = decade;
  // Clear pool so next fetch uses the new decade
  state.candidatePool = [];
  state.lastFetchStation = null;
}

export function getTimeMachineDecade(): number | null {
  return timeMachineDecade;
}

/** Called after each track to auto-expire the filter */
function tickFilter() {
  if (!activeFilter) return;
  activeFilter.tracksPlayed++;
  if (activeFilter.tracksPlayed >= activeFilter.expiresAfterTracks) {
    activeFilter = null;
    // Clear pool so normal selection resumes
    state.candidatePool = [];
    state.lastFetchStation = null;
  }
}

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

export function getMoodTarget(): MoodPoint {
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
  likedArtistNames: string[]; // Artist names for DJ personalization
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
        likedArtistNames: parsed.likedArtistNames || [],
        likedGenreBoosts: parsed.likedGenreBoosts || {},
        lastUpdated: parsed.lastUpdated || Date.now(),
      };
    }
  } catch { }
  return {
    likedArtistIds: [],
    skippedArtistIds: [],
    likedArtistNames: [],
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
    for (let i = 0; i < artistIds.length; i++) {
      const id = artistIds[i];
      const name = track.artists[i]?.name;
      if (!profile.likedArtistIds.includes(id)) {
        profile.likedArtistIds.push(id);
        if (profile.likedArtistIds.length > MAX_TASTE_ARTISTS) {
          profile.likedArtistIds.shift();
        }
        // Store artist name for DJ personalization
        if (name && !profile.likedArtistNames.includes(name)) {
          profile.likedArtistNames.push(name);
          if (profile.likedArtistNames.length > MAX_TASTE_ARTISTS) {
            profile.likedArtistNames.shift();
          }
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



  // Tick temporary filter (DJ requests)
  tickFilter();

  // Advance rotation
  state.rotationPosition =
    (state.rotationPosition + 1) % ROTATION_CLOCK.length;

  // Remove this track from candidate pool
  state.candidatePool = state.candidatePool.filter((t) => t.id !== track.id);

  return track;
}

// Last score breakdown for "Why this song?" feature
let lastTrackBreakdown: TrackScoreBreakdown | null = null;

export function getLastTrackBreakdown(): TrackScoreBreakdown | null {
  return lastTrackBreakdown;
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
    const popularityScore = pop / 100;
    score += popularityScore;

    // Rotation slot bonus: favor tracks matching current rotation category
    const slot = ROTATION_CLOCK[state.rotationPosition % ROTATION_CLOCK.length];
    const releaseYear = getReleaseYear(track);
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    let rotationBonus = 0;
    if (slot === "C" && age <= 2 && pop >= 60) rotationBonus = 0.3;
    else if (slot === "R" && age > 2 && age <= 8 && pop >= 40) rotationBonus = 0.25;
    else if (slot === "G" && age > 8) rotationBonus = 0.2;
    score += rotationBonus;

    // Taste bonus: liked artists
    const artistIds = track.artists.map((a) => a.id);
    const isLikedArtist = artistIds.some((id) => profile.likedArtistIds.includes(id));
    let tasteBonus = 0;
    if (isLikedArtist) {
      tasteBonus += 0.2;
    }
    if (artistIds.some((id) => profile.skippedArtistIds.includes(id))) {
      tasteBonus -= 0.3;
    }
    score += tasteBonus;

    // Discovery mode adjustments
    let discoveryBonus = 0;
    if (discoveryModeEnabled) {
      if (isLikedArtist) {
        discoveryBonus -= 0.25;
      }
      if (pop < 50) discoveryBonus += 0.2;
      if (pop < 30) discoveryBonus += 0.1;
    }
    score += discoveryBonus;

    // Artist frequency penalty (diminishing returns)
    let artistPenalty = 0;
    for (const artist of track.artists) {
      const playCount = state.artistPlayCounts.get(artist.id) || 0;
      if (playCount > 0) {
        artistPenalty -= Math.min(0.4, playCount * 0.1);
      }
    }
    score += artistPenalty;

    // Popularity range bonus: tracks within station's preferred range get a boost
    let popRangeBonus = 0;
    if (
      pop >= station.popularityRange.min &&
      pop <= station.popularityRange.max
    ) {
      popRangeBonus = 0.1;
    }
    score += popRangeBonus;

    // Mood arc: time-of-day energy alignment
    // Use popularity as a proxy for energy (no extra API calls needed)
    const moodTarget = getMoodTarget();
    const estimatedEnergy = pop / 100; // Higher popularity ≈ more energetic
    const energyDiff = Math.abs(estimatedEnergy - moodTarget.energy);
    // Reward tracks that match the mood target (smaller diff = bigger bonus)
    const moodBonus = Math.max(0, 0.15 - energyDiff * 0.2);
    score += moodBonus;

    // DJ Request energy filter: boost tracks matching requested energy range
    if (activeFilter?.energyRange) {
      const { min: eMin, max: eMax } = activeFilter.energyRange;
      if (estimatedEnergy >= eMin && estimatedEnergy <= eMax) {
        score += 0.25; // Strong boost for matching energy
      } else {
        score -= 0.15; // Penalize tracks outside requested range
      }
    }

    // Random factor for variety
    score += (Math.random() - 0.5) * 0.12;

    const breakdown: TrackScoreBreakdown = {
      popularity: popularityScore,
      rotationSlot: slot,
      rotationBonus,
      tasteBonus,
      discoveryBonus,
      artistFrequencyPenalty: artistPenalty,
      popularityRangeBonus: popRangeBonus,
      totalScore: score,
    };

    return { track, score, breakdown };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Store breakdown of the winning track
  if (scored.length > 0) {
    lastTrackBreakdown = scored[0].breakdown;
  }

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
  const currentYear = new Date().getFullYear();
  const queries: string[] = [];

  // If there's an active filter with artist search, prioritize that
  if (activeFilter?.artistSearch) {
    queries.push(`artist:${activeFilter.artistSearch}`);
    queries.push(`${activeFilter.artistSearch}`);
    return queries;
  }

  // Use filter's genre boost terms if available, otherwise station terms
  const terms = activeFilter?.genreBoost || station.searchTerms;

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

      // Time Machine: override year range with selected decade
      if (timeMachineDecade) {
        yearMin = timeMachineDecade;
        yearMax = timeMachineDecade + 9;
      } else if (activeFilter?.yearRange) {
        // Use filter's year range if active
        yearMin = activeFilter.yearRange.min;
        yearMax = activeFilter.yearRange.max;
      } else if (discoveryModeEnabled) {
        // Discovery mode: widen to full station range for maximum variety
        yearMin = station.yearRange.min;
        yearMax = station.yearRange.max;
      } else {
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
      }

      // Ensure year range is valid (only clamp to station range when no override)
      if (!activeFilter?.yearRange && !timeMachineDecade) {
        yearMin = Math.max(yearMin, station.yearRange.min);
        yearMax = Math.min(yearMax, station.yearRange.max);
      }
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

// ── Custom Station Selection ────────────────────────────────

// Separate candidate pool for custom stations
let customCandidatePool: SpotifyTrack[] = [];
let lastCustomStationId: string | null = null;

export async function selectNextTrackForCustom(
  customStation: CustomStationConfig,
  accessToken: string
): Promise<SpotifyTrack | null> {
  // Clear pool if station changed
  if (lastCustomStationId !== customStation.id) {
    customCandidatePool = [];
    lastCustomStationId = customStation.id;
  }

  // Refill pool if low
  if (customCandidatePool.length < 5) {
    const queries = buildCustomSearchQueries(customStation);
    const results = await searchTracksMulti(accessToken, queries, 15);
    const filtered = results.filter(
      (t) => (t.popularity ?? 50) >= Math.max(0, customStation.popularityRange.min - 15)
    );
    customCandidatePool.push(...filtered);
  }

  // Filter eligible
  const eligible = customCandidatePool.filter((track) => {
    if (state.playedTrackIds.has(track.id)) return false;
    const artistIds = track.artists.map((a) => a.id);
    if (artistIds.some((id) => state.recentArtistIds.includes(id))) return false;
    if (track.duration_ms < 60000 || track.duration_ms > 600000) return false;
    return true;
  });

  if (eligible.length === 0) {
    const relaxed = customCandidatePool.filter((t) => !state.playedTrackIds.has(t.id));
    if (relaxed.length === 0) {
      customCandidatePool = [];
      const queries = buildCustomSearchQueries(customStation);
      const fresh = await searchTracksMulti(accessToken, queries, 15);
      if (fresh.length === 0) return null;
      return pickAndRecord(fresh[0]);
    }
    return pickAndRecord(scoreCustomTracks(relaxed, customStation)[0]);
  }

  const scored = scoreCustomTracks(eligible, customStation);
  return pickAndRecord(scored[0]);
}

function buildCustomSearchQueries(custom: CustomStationConfig): string[] {
  const currentYear = new Date().getFullYear();
  const queries: string[] = [];
  const shuffled = [...custom.searchTerms].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  for (const term of picked) {
    // Treat multi-word capitalized terms as artist names
    const looksLikeArtist = /^[A-Z]/.test(term) && !term.match(/^(pop|rock|jazz|chill|house|dance|indie|hip hop|r&b|soul|funk|blues|country|metal|punk|electronic)/i);
    if (looksLikeArtist) {
      queries.push(`artist:${term}`);
    } else {
      const yearMin = Math.max(custom.yearRange.min, 1950);
      const yearMax = Math.min(custom.yearRange.max, currentYear);
      queries.push(`genre:${term} year:${yearMin}-${yearMax}`);
    }
  }

  return queries;
}

function scoreCustomTracks(
  tracks: SpotifyTrack[],
  custom: CustomStationConfig
): SpotifyTrack[] {
  const profile = state.tasteProfile;

  const scored = tracks.map((track) => {
    let score = 0;
    const pop = track.popularity ?? 50;
    score += pop / 100;

    const artistIds = track.artists.map((a) => a.id);
    if (artistIds.some((id) => profile.likedArtistIds.includes(id))) score += 0.15;
    if (artistIds.some((id) => profile.skippedArtistIds.includes(id))) score -= 0.3;

    for (const artist of track.artists) {
      const playCount = state.artistPlayCounts.get(artist.id) || 0;
      if (playCount > 0) score -= Math.min(0.4, playCount * 0.1);
    }

    if (pop >= custom.popularityRange.min && pop <= custom.popularityRange.max) score += 0.1;

    if (discoveryModeEnabled) {
      if (pop < 50) score += 0.2;
      if (pop < 30) score += 0.1;
    }

    score += (Math.random() - 0.5) * 0.12;
    return { track, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.track);
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
