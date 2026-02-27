// ═══════════════════════════════════════════════════════════════
//  VOICE MAPPER — Station → TTS voice + prosody configuration
// ═══════════════════════════════════════════════════════════════

import { getStation, type StationId } from "@/config/stations";
import type { DJVoice } from "@/types";

export interface VoiceConfig {
  voice: DJVoice;
  rate: string;
  pitch: string;
  ttsVolume: number;
}

/**
 * Get the TTS voice configuration for a station
 */
export function getVoiceConfig(stationId: StationId): VoiceConfig {
  const station = getStation(stationId);
  const { djProfile } = station;

  return {
    voice: djProfile.voice,
    rate: djProfile.rate,
    pitch: djProfile.pitch,
    ttsVolume: 0.9,
  };
}

/**
 * Get DJ name for a station
 */
export function getDJName(stationId: StationId): string {
  return getStation(stationId).djProfile.name;
}

/**
 * Get a random interjection for a station
 */
export function getInterjection(stationId: StationId): string {
  const { interjections } = getStation(stationId).djProfile;
  return interjections[Math.floor(Math.random() * interjections.length)];
}
