import type { StationId } from "@/config/stations";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
    release_date?: string;
  };
  duration_ms: number;
  uri: string;
  preview_url: string | null;
  popularity?: number;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  humidity: number;
  wind_speed: number;
  sunrise?: number;
  sunset?: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface SongHistoryEntry {
  track: SpotifyTrack;
  playedAt: string;
  genre: Genre;
}

export interface RadioState {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  currentGenre: Genre;
  volume: number;
  isAnnouncerSpeaking: boolean;
  songsUntilAnnouncement: number;
  weather: WeatherData | null;
  news: NewsArticle[];
  deviceId: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

// Genre is now an alias for StationId — 10 stations
export type Genre = StationId;

export type DJVoice =
  | "nl-NL-FennaNeural"
  | "nl-NL-ColetteNeural"
  | "nl-NL-MaartenNeural"
  | "en-US-JennyNeural"
  | "en-US-GuyNeural"
  | "de-DE-KatjaNeural"
  | "de-DE-ConradNeural";

// Legacy GenreConfig kept for compatibility — use StationConfig from @/config/stations instead
export interface GenreConfig {
  id: Genre;
  label: string;
  frequency: string;
  searchTerms: string[];
  color: string;
  icon: string;
}

// Re-export STATIONS as GENRES for backward compatibility
export { STATIONS as GENRES } from "@/config/stations";

export interface CustomStationConfig {
  id: string;
  label: string;
  searchTerms: string[];
  yearRange: { min: number; max: number };
  popularityRange: { min: number; max: number };
  color: string;
  icon: string;
  isCustom: true;
}

export type RadioAction =
  | { type: "PLAY_TRACK"; track: SpotifyTrack }
  | { type: "ANNOUNCE"; script: string }
  | { type: "QUEUE_TRACKS"; tracks: SpotifyTrack[] };

// Score breakdown for "Why this song?" feature
export type RotationSlot = "C" | "R" | "G"; // Current, Recurrent, Gold

export interface TrackScoreBreakdown {
  popularity: number;
  rotationSlot: RotationSlot;
  rotationBonus: number;
  tasteBonus: number;
  discoveryBonus: number;
  artistFrequencyPenalty: number;
  popularityRangeBonus: number;
  totalScore: number;
}

export interface SelectionResult {
  track: SpotifyTrack;
  breakdown: TrackScoreBreakdown;
}
