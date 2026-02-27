// ═══════════════════════════════════════════════════════════════
//  DJ SCRIPTS — Facade delegating to dj/ modules
//  Kept for backward compatibility with useRadioEngine
// ═══════════════════════════════════════════════════════════════

import type { StationId } from "@/config/stations";
import { generateStationScript, type ScriptOptions } from "@/services/dj/script-generator";
import {
  pickAnnouncementType as schedulerPick,
  shouldPrependJingle,
} from "@/services/dj/scheduler";

export type ScriptType =
  | "intro"
  | "between"
  | "weather"
  | "weather_full"
  | "news"
  | "news_full"
  | "time"
  | "outro"
  | "station_id"
  | "fun_fact"
  | "song_intro"
  | "jingle";

/**
 * Generate a DJ script for a specific station
 * This is the main function components should call
 */
export function generateScript(
  type: ScriptType,
  options: ScriptOptions & { stationId?: StationId } = {}
): string {
  const stationId = options.stationId || "pop";
  return generateStationScript(stationId, type, options);
}

/**
 * Pick the type of announcement to play
 * Now delegates to the station-aware scheduler
 */
export function pickAnnouncementType(
  songsSinceAnnouncement: number,
  hasWeather: boolean,
  hasNews: boolean,
  stationId: StationId = "pop"
): ScriptType {
  return schedulerPick(stationId, songsSinceAnnouncement, hasWeather, hasNews);
}

/**
 * Generate a multi-segment announcement
 * Returns array of text segments played sequentially
 */
export function generateMultiSegment(
  primaryType: ScriptType,
  options: ScriptOptions & { stationId?: StationId } = {}
): string[] {
  const stationId = options.stationId || "pop";
  const segments: string[] = [];

  // Sometimes prepend a jingle
  if (shouldPrependJingle(primaryType, stationId)) {
    segments.push(generateStationScript(stationId, "jingle", options));
  }

  // Main segment
  segments.push(generateStationScript(stationId, primaryType, options));

  return segments;
}
