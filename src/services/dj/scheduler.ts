// ═══════════════════════════════════════════════════════════════
//  DJ SCHEDULER — Controls when and what DJ segments play
// ═══════════════════════════════════════════════════════════════

import { getStation, getTimeOfDay, type StationId, type TimeOfDay } from "@/config/stations";
import type { ScriptType } from "@/services/dj-scripts";

// Track recently used segment types to prevent repetition
const recentSegments: ScriptType[] = [];
const MAX_RECENT = 6;

function trackSegment(type: ScriptType) {
  recentSegments.push(type);
  if (recentSegments.length > MAX_RECENT) {
    recentSegments.shift();
  }
}

/**
 * Decide how many songs between announcements for a station
 * Based on station talkativeness + time of day
 */
export function getSongsUntilAnnouncement(stationId: StationId): number {
  const station = getStation(stationId);
  const talkativeness = station.djProfile.talkativeness; // 0.3 – 1.0
  const tod = getTimeOfDay();

  // Base interval: inverse of talkativeness (high talk = fewer songs between)
  // talkativeness 1.0 → 2-3 songs, talkativeness 0.3 → 5-8 songs
  const baseMin = Math.round(2 + (1 - talkativeness) * 4);
  const baseMax = Math.round(4 + (1 - talkativeness) * 5);

  // Time-of-day modifier
  let modifier = 0;
  switch (tod) {
    case "morning":
      modifier = -1; // More talk in the morning (news, weather)
      break;
    case "night":
      modifier = 2; // Less talk at night
      break;
    default:
      modifier = 0;
  }

  const min = Math.max(2, baseMin + modifier);
  const max = Math.max(min + 1, baseMax + modifier);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick the type of announcement based on station config, context, and scheduling rules
 */
export function pickAnnouncementType(
  stationId: StationId,
  songsSinceAnnouncement: number,
  hasWeather: boolean,
  hasNews: boolean
): ScriptType {
  const station = getStation(stationId);
  const weights = station.segmentWeights;
  const tod = getTimeOfDay();

  // Morning bias: favor weather + news
  const morningBoost = tod === "morning" ? 1.5 : 1.0;
  // Night reduction: reduce talky segments
  const nightReduction = tod === "night" ? 0.5 : 1.0;

  // Build weighted candidates
  const candidates: { type: ScriptType; weight: number }[] = [];

  // Full weather (longer segment) — only if we have weather data and haven't done it recently
  if (hasWeather && !recentSegments.includes("weather_full") && songsSinceAnnouncement >= 5) {
    candidates.push({ type: "weather_full", weight: weights.weather * morningBoost * 1.2 });
  }
  // Short weather
  if (hasWeather && !recentSegments.includes("weather")) {
    candidates.push({ type: "weather", weight: weights.weather * morningBoost });
  }

  // Full news (longer segment)
  if (hasNews && !recentSegments.includes("news_full") && songsSinceAnnouncement >= 6) {
    candidates.push({ type: "news_full", weight: weights.news * morningBoost * 1.2 });
  }
  // Short news
  if (hasNews && !recentSegments.includes("news")) {
    candidates.push({ type: "news", weight: weights.news * morningBoost });
  }

  // Fun fact
  if (!recentSegments.includes("fun_fact")) {
    candidates.push({ type: "fun_fact", weight: weights.fun_fact * nightReduction });
  }

  // Station ID
  if (!recentSegments.includes("station_id")) {
    candidates.push({ type: "station_id", weight: weights.station_id });
  }

  // Song intro
  candidates.push({ type: "song_intro", weight: weights.song_intro });

  // Jingle
  if (!recentSegments.includes("jingle")) {
    candidates.push({ type: "jingle", weight: weights.jingle });
  }

  // Time check
  candidates.push({ type: "time", weight: weights.time });

  // Between tracks (always available as fallback)
  candidates.push({ type: "between", weight: 0.1 });

  // Weighted random selection
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) {
      trackSegment(candidate.type);
      return candidate.type;
    }
  }

  // Fallback
  trackSegment("between");
  return "between";
}

/**
 * Whether to prepend a jingle before the main segment
 */
export function shouldPrependJingle(primaryType: ScriptType, stationId: StationId): boolean {
  const station = getStation(stationId);
  // Energetic stations jingle more
  const jingleChance = station.djProfile.tone === "energetic" ? 0.45 : 0.25;
  return (
    Math.random() < jingleChance &&
    primaryType !== "station_id" &&
    primaryType !== "jingle"
  );
}

/**
 * Reset scheduler state (call on station change)
 */
export function resetScheduler(): void {
  recentSegments.length = 0;
}
