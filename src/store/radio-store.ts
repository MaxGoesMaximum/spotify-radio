"use client";

import { create } from "zustand";
import type { SpotifyTrack, WeatherData, NewsArticle, SongHistoryEntry, DJVoice, CustomStationConfig } from "@/types";
import type { StationId } from "@/config/stations";
import type { ThemeId } from "@/config/themes";

/* ─── Debounced preference sync to DB ─── */
let prefSaveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSavePreferences(data: Record<string, unknown>) {
  if (prefSaveTimer) clearTimeout(prefSaveTimer);
  prefSaveTimer = setTimeout(() => {
    fetch("/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => { });
  }, 1000);
}

type Genre = StationId;

/* ─── localStorage helpers ─── */
function loadPersistedVolume(): number {
  if (typeof window === "undefined") return 0.7;
  try {
    const v = localStorage.getItem("sr_volume");
    if (v !== null) {
      const n = parseFloat(v);
      if (!isNaN(n) && n >= 0 && n <= 1) return n;
    }
  } catch { }
  return 0.7;
}

function loadPersistedFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const f = localStorage.getItem("sr_favorites");
    if (f) return JSON.parse(f);
  } catch { }
  return [];
}

function loadPersistedStation(): Genre {
  if (typeof window === "undefined") return "pop";
  try {
    const s = localStorage.getItem("sr_station");
    if (s) return s as Genre;
  } catch { }
  return "pop";
}

function loadPersistedDiscoveryMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("sr_discovery_mode") === "true";
  } catch { }
  return false;
}

function loadPersistedCustomStations(): CustomStationConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem("sr_custom_stations");
    if (s) return JSON.parse(s);
  } catch { }
  return [];
}

interface RadioStore {
  // Playback
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  volume: number;
  progress: number;
  duration: number;

  // Radio
  currentGenre: Genre;
  isAnnouncerSpeaking: boolean;
  songsUntilAnnouncement: number;
  songsSinceAnnouncement: number;
  currentSegmentType: string | null;

  // DJ Settings
  djVoice: DJVoice;

  // Song History
  songHistory: SongHistoryEntry[];

  // Favorites
  favorites: string[];

  // Sleep Timer
  sleepTimerEnd: number | null;
  sleepTimerDuration: number | null; // original duration in ms

  // Immersion
  listenerCount: number;

  // Session stats
  skipCount: number;
  sessionTrackCount: number;

  // Theme
  themeId: ThemeId;

  // Party Mode
  partyMode: boolean;

  // Crossfade
  crossfadeEnabled: boolean;
  crossfadeDuration: number; // seconds

  // Settings
  djFrequency: string; // "low", "normal", "high"

  // External data
  weather: WeatherData | null;
  news: NewsArticle[];
  weatherLastUpdated: number | null;
  newsLastUpdated: number | null;
  location: { lat: number; lon: number } | null;

  // Connection
  deviceId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  reconnectAttempts: number;

  // Notifications
  notificationsEnabled: boolean;

  // Discovery
  discoveredTrackCount: number;
  discoveryMode: boolean;

  // Custom Stations
  customStations: CustomStationConfig[];
  activeCustomStationId: string | null;

  // Actions
  setPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  addToQueue: (tracks: SpotifyTrack[]) => void;
  popQueue: () => SpotifyTrack | undefined;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setGenre: (genre: Genre) => void;
  setAnnouncerSpeaking: (speaking: boolean) => void;
  setCurrentSegment: (type: string | null) => void;
  decrementSongsUntilAnnouncement: () => void;
  resetAnnouncementCounter: () => void;
  setSongsUntilAnnouncement: (count: number) => void;
  setWeather: (weather: WeatherData) => void;
  setNews: (news: NewsArticle[]) => void;
  setWeatherLastUpdated: (timestamp: number) => void;
  setNewsLastUpdated: (timestamp: number) => void;
  setLocation: (location: { lat: number; lon: number }) => void;
  setDeviceId: (id: string) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  addToHistory: (track: SpotifyTrack, genre: Genre) => void;
  toggleFavorite: (trackId: string) => void;
  setDJVoice: (voice: DJVoice) => void;
  setSleepTimer: (endTime: number | null, durationMs?: number | null) => void;
  setListenerCount: (count: number) => void;
  incrementSkipCount: () => void;
  incrementSessionTrackCount: () => void;
  setThemeId: (id: ThemeId) => void;
  togglePartyMode: () => void;
  setPartyMode: (on: boolean) => void;
  setCrossfadeEnabled: (on: boolean) => void;
  setCrossfadeDuration: (seconds: number) => void;
  setReconnectAttempts: (n: number) => void;
  setNotificationsEnabled: (on: boolean) => void;
  setDjFrequency: (frequency: string) => void;
  incrementDiscoveredCount: () => void;
  toggleDiscoveryMode: () => void;
  addCustomStation: (station: CustomStationConfig) => void;
  removeCustomStation: (id: string) => void;
  setActiveCustomStation: (id: string | null) => void;
}

export const useRadioStore = create<RadioStore>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  queue: [],
  volume: loadPersistedVolume(),
  progress: 0,
  duration: 0,
  currentGenre: loadPersistedStation(),
  isAnnouncerSpeaking: false,
  songsUntilAnnouncement: 3,
  songsSinceAnnouncement: 0,
  currentSegmentType: null,
  djVoice: "nl-NL-FennaNeural",
  songHistory: [],
  favorites: loadPersistedFavorites(),
  sleepTimerEnd: null,
  sleepTimerDuration: null,
  listenerCount: Math.floor(Math.random() * 500) + 1000,
  skipCount: 0,
  sessionTrackCount: 0,
  themeId: "dark" as ThemeId,
  partyMode: false,
  crossfadeEnabled: false,
  crossfadeDuration: 3,
  weather: null,
  news: [],
  weatherLastUpdated: null,
  newsLastUpdated: null,
  location: null,
  deviceId: null,
  isConnected: false,
  isLoading: false,
  reconnectAttempts: 0,
  notificationsEnabled: false,
  djFrequency: "normal",
  discoveredTrackCount: 0,
  discoveryMode: loadPersistedDiscoveryMode(),
  customStations: loadPersistedCustomStations(),
  activeCustomStationId: null,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  addToQueue: (tracks) =>
    set((state) => ({ queue: [...state.queue, ...tracks] })),
  popQueue: () => {
    const { queue } = get();
    if (queue.length === 0) return undefined;
    const [next, ...rest] = queue;
    set({ queue: rest });
    return next;
  },
  setVolume: (volume) => {
    set({ volume });
    try { localStorage.setItem("sr_volume", String(volume)); } catch { }
    debouncedSavePreferences({ volume });
  },
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setGenre: (genre) => {
    set({ currentGenre: genre, queue: [] });
    try { localStorage.setItem("sr_station", genre); } catch { }
    debouncedSavePreferences({ lastStation: genre });
  },
  setAnnouncerSpeaking: (speaking) => set({ isAnnouncerSpeaking: speaking }),
  setCurrentSegment: (type) => set({ currentSegmentType: type }),
  decrementSongsUntilAnnouncement: () =>
    set((state) => ({
      songsUntilAnnouncement: state.songsUntilAnnouncement - 1,
      songsSinceAnnouncement: state.songsSinceAnnouncement + 1,
    })),
  resetAnnouncementCounter: () =>
    set({
      songsUntilAnnouncement: Math.floor(Math.random() * 3) + 2,
      songsSinceAnnouncement: 0,
    }),
  setSongsUntilAnnouncement: (count) =>
    set({
      songsUntilAnnouncement: Math.max(2, count),
      songsSinceAnnouncement: 0,
    }),
  setWeather: (weather) => set({ weather, weatherLastUpdated: Date.now() }),
  setNews: (news) => set({ news, newsLastUpdated: Date.now() }),
  setWeatherLastUpdated: (timestamp) => set({ weatherLastUpdated: timestamp }),
  setNewsLastUpdated: (timestamp) => set({ newsLastUpdated: timestamp }),
  setLocation: (location) => set({ location }),
  setDeviceId: (id) => set({ deviceId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),

  addToHistory: (track, genre) =>
    set((state) => ({
      songHistory: [
        { track, playedAt: new Date().toISOString(), genre },
        ...state.songHistory,
      ].slice(0, 50),
    })),
  toggleFavorite: (trackId) =>
    set((state) => {
      const isFav = state.favorites.includes(trackId);
      const next = isFav
        ? state.favorites.filter((id) => id !== trackId)
        : [...state.favorites, trackId];
      try { localStorage.setItem("sr_favorites", JSON.stringify(next)); } catch { }
      return { favorites: next };
    }),
  setDJVoice: (voice) => {
    set({ djVoice: voice });
    debouncedSavePreferences({ djVoice: voice });
  },
  setSleepTimer: (endTime, durationMs) => set({ sleepTimerEnd: endTime, sleepTimerDuration: durationMs ?? null }),
  setListenerCount: (count) => set({ listenerCount: count }),
  incrementSkipCount: () => set((s) => ({ skipCount: s.skipCount + 1 })),
  incrementSessionTrackCount: () => set((s) => ({ sessionTrackCount: s.sessionTrackCount + 1 })),
  setThemeId: (id) => {
    set({ themeId: id });
    debouncedSavePreferences({ theme: id });
  },
  togglePartyMode: () => set((s) => ({ partyMode: !s.partyMode })),
  setPartyMode: (on) => set({ partyMode: on }),
  setCrossfadeEnabled: (on) => {
    set({ crossfadeEnabled: on });
    debouncedSavePreferences({ crossfade: on });
  },
  setCrossfadeDuration: (seconds) => set({ crossfadeDuration: Math.max(1, Math.min(12, seconds)) }),
  setReconnectAttempts: (n) => set({ reconnectAttempts: n }),
  setNotificationsEnabled: (on) => set({ notificationsEnabled: on }),
  setDjFrequency: (frequency) => {
    set({ djFrequency: frequency });
    debouncedSavePreferences({ djFrequency: frequency });
  },
  incrementDiscoveredCount: () => set((s) => ({ discoveredTrackCount: s.discoveredTrackCount + 1 })),
  toggleDiscoveryMode: () => {
    const next = !get().discoveryMode;
    set({ discoveryMode: next });
    try { localStorage.setItem("sr_discovery_mode", String(next)); } catch { }
  },
  addCustomStation: (station) =>
    set((s) => {
      const next = [...s.customStations, station].slice(0, 5);
      try { localStorage.setItem("sr_custom_stations", JSON.stringify(next)); } catch { }
      return { customStations: next };
    }),
  removeCustomStation: (id) =>
    set((s) => {
      const next = s.customStations.filter((st) => st.id !== id);
      try { localStorage.setItem("sr_custom_stations", JSON.stringify(next)); } catch { }
      return {
        customStations: next,
        activeCustomStationId: s.activeCustomStationId === id ? null : s.activeCustomStationId,
      };
    }),
  setActiveCustomStation: (id) => set({ activeCustomStationId: id }),
}));
