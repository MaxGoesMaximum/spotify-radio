"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/session");
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setStatus("authenticated");

        // Hydrate store with DB preferences on first load
        if (data.preferences) {
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
      setSession(null);
      setStatus("unauthenticated");
    }
  }, [setVolume, setThemeId, setDJVoice, setGenre, setNotificationsEnabled, setDjFrequency, setCrossfadeEnabled]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, status, refresh: fetchSession };
}
