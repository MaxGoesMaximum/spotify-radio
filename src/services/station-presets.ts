// ═══════════════════════════════════════════════════════════════
//  STATION PRESETS — Encode/decode station+theme as shareable URLs
// ═══════════════════════════════════════════════════════════════

import type { StationId } from "@/config/stations";
import type { ThemeId } from "@/config/themes";

interface Preset {
  stationId: StationId;
  themeId: ThemeId;
}

/**
 * Encode a preset to a URL-safe base64 string
 */
export function encodePreset(preset: Preset): string {
  const json = JSON.stringify({ s: preset.stationId, t: preset.themeId });
  // Use btoa for simple encoding (URL-safe base64)
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a preset string back to station + theme
 * Returns null if invalid
 */
export function decodePreset(encoded: string): Preset | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    const data = JSON.parse(json);
    if (data.s && data.t) {
      return { stationId: data.s as StationId, themeId: data.t as ThemeId };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a shareable URL with preset parameter
 */
export function generatePresetUrl(preset: Preset): string {
  const encoded = encodePreset(preset);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/radio?preset=${encoded}`;
}
