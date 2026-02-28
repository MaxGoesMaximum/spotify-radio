"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRadioStore } from "@/store/radio-store";
import type { ThemeId } from "@/config/themes";
import type { DJVoice } from "@/types";

interface SpotifyUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface SpotifySession {
  accessToken: string;
  user: SpotifyUser;
}

interface UseSpotifySessionReturn {
  session: SpotifySession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<void>;
}

const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useSpotifySession(): UseSpotifySessionReturn {
  const [session, setSession] = useState<SpotifySession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const setVolume = useRadioStore((s) => s.setVolume);
  const setThemeId = useRadioStore((s) => s.setThemeId);
  const setDJVoice = useRadioStore((s) => s.setDJVoice);
  const setGenre = useRadioStore((s) => s.setGenre);
  const setNotificationsEnabled = useRadioStore((s) => s.setNotificationsEnabled);
  const setDjFrequency = useRadioStore((s) => s.setDjFrequency);
  const setCrossfadeEnabled = useRadioStore((s) => s.setCrossfadeEnabled);

  const hasHydratedPrefs = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval>>();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/session");
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setStatus("authenticated");

        // Hydrate store with DB preferences only on first successful load
        if (data.preferences && !hasHydratedPrefs.current) {
          hasHydratedPrefs.current = true;
          const p = data.preferences;
          if (p.volume != null) setVolume(p.volume);
          if (p.theme) setThemeId(p.theme as ThemeId);
          if (p.djVoice) setDJVoice(p.djVoice as DJVoice);
          if (p.lastStation) setGenre(p.lastStation as Parameters<typeof setGenre>[0]);
          if (p.notificationsEnabled != null) setNotificationsEnabled(p.notificationsEnabled);
          if (p.djFrequency) setDjFrequency(p.djFrequency);
          if (p.crossfade != null) setCrossfadeEnabled(p.crossfade);
        }
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch {
      // Network error — keep existing session if we have one,
      // only set unauthenticated if we never had a session
      if (!session) {
        setSession(null);
        setStatus("unauthenticated");
      }
    }
  }, [setVolume, setThemeId, setDJVoice, setGenre, setNotificationsEnabled, setDjFrequency, setCrossfadeEnabled, session]);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic token refresh — the server-side session endpoint auto-refreshes
  // tokens that are within 60s of expiry, so polling every 10min ensures
  // long sessions stay alive.
  useEffect(() => {
    if (status !== "authenticated") return;

    refreshTimerRef.current = setInterval(() => {
      console.log("[Session] Proactive token refresh...");
      fetchSession();
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [status, fetchSession]);

  // Also refresh when the tab regains focus (user may have been away for hours)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "authenticated") {
        console.log("[Session] Tab refocused, refreshing token...");
        fetchSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, fetchSession]);

  return { session, status, refresh: fetchSession };
}
