// ═══════════════════════════════════════════════════════════════
//  VOICE MAPPER — Station → TTS voice + prosody configuration
// ═══════════════════════════════════════════════════════════════

import { getStation, type StationId, type DJTone } from "@/config/stations";
import type { DJVoice } from "@/types";

export interface VoiceConfig {
  voice: DJVoice;
  rate: string;
  pitch: string;
  ttsVolume: number;
}

export interface ProsodyStyle {
  /** Pause duration after sentences (ms) */
  sentencePauseMs: number;
  /** Pause duration after commas (ms) */
  commaPauseMs: number;
  /** Extra dramatic pause for effect (ms) */
  dramaticPauseMs: number;
  /** How often to insert a breath mark (0-1, probability per sentence boundary) */
  breathFrequency: number;
  /** Emphasis level for proper nouns: "moderate" | "strong" | "reduced" */
  emphasisLevel: "moderate" | "strong" | "reduced";
  /** Whether to add subtle pitch variation hints in scripts */
  pitchVariation: boolean;
}

// Per-tone prosody styles
const TONE_PROSODY: Record<DJTone, ProsodyStyle> = {
  energetic: {
    sentencePauseMs: 250,
    commaPauseMs: 100,
    dramaticPauseMs: 400,
    breathFrequency: 0.15,
    emphasisLevel: "strong",
    pitchVariation: true,
  },
  chill: {
    sentencePauseMs: 450,
    commaPauseMs: 200,
    dramaticPauseMs: 700,
    breathFrequency: 0.3,
    emphasisLevel: "reduced",
    pitchVariation: false,
  },
  warm: {
    sentencePauseMs: 350,
    commaPauseMs: 150,
    dramaticPauseMs: 500,
    breathFrequency: 0.2,
    emphasisLevel: "moderate",
    pitchVariation: true,
  },
  smooth: {
    sentencePauseMs: 400,
    commaPauseMs: 180,
    dramaticPauseMs: 600,
    breathFrequency: 0.25,
    emphasisLevel: "moderate",
    pitchVariation: false,
  },
  edgy: {
    sentencePauseMs: 200,
    commaPauseMs: 80,
    dramaticPauseMs: 350,
    breathFrequency: 0.1,
    emphasisLevel: "strong",
    pitchVariation: true,
  },
};

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
 * Get prosody style for a station's DJ tone
 */
export function getProsodyStyle(stationId: StationId): ProsodyStyle {
  const station = getStation(stationId);
  return TONE_PROSODY[station.djProfile.tone];
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
