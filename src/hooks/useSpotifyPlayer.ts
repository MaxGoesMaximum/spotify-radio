"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/store/radio-store";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export function useSpotifyPlayer(accessToken: string | undefined) {
  const playerRef = useRef<any>(null);
  const setDeviceId = useRadioStore((s) => s.setDeviceId);
  const setConnected = useRadioStore((s) => s.setConnected);
  const setPlaying = useRadioStore((s) => s.setPlaying);
  const setCurrentTrack = useRadioStore((s) => s.setCurrentTrack);
  const setProgress = useRadioStore((s) => s.setProgress);
  const setDuration = useRadioStore((s) => s.setDuration);
  const volume = useRadioStore((s) => s.volume);
  const onTrackEndRef = useRef<(() => void) | null>(null);

  const setOnTrackEnd = useCallback((cb: () => void) => {
    onTrackEndRef.current = cb;
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Spotify Radio",
        getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
        volume: volume,
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Spotify Player ready, device:", device_id);
        setDeviceId(device_id);
        setConnected(true);
      });

      player.addListener("not_ready", () => {
        console.log("Spotify Player not ready, attempting reconnect...");
        setConnected(false);

        // Auto-reconnect with 3 attempts
        let attempts = 0;
        const maxAttempts = 3;
        const tryReconnect = () => {
          if (attempts >= maxAttempts) return;
          attempts++;
          setTimeout(() => {
            console.log(`Reconnect attempt ${attempts}/${maxAttempts}`);
            player.connect().catch(() => tryReconnect());
          }, attempts * 2000); // 2s, 4s, 6s
        };
        tryReconnect();
      });

      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        const track = state.track_window?.current_track;
        if (track) {
          setCurrentTrack({
            id: track.id,
            name: track.name,
            artists: track.artists.map((a: any) => ({
              id: a.uri?.split(":").pop() || "",
              name: a.name,
            })),
            album: {
              id: track.album?.uri?.split(":").pop() || "",
              name: track.album?.name || "",
              images: track.album?.images || [],
            },
            duration_ms: track.duration_ms,
            uri: track.uri,
            preview_url: null,
          });
          setDuration(track.duration_ms);
        }

        setPlaying(!state.paused);
        setProgress(state.position);

        // Detect track end
        if (
          state.paused &&
          state.position === 0 &&
          state.track_window?.previous_tracks?.length > 0
        ) {
          onTrackEndRef.current?.();
        }
      });

      player.addListener("initialization_error", ({ message }: any) => {
        console.error("Init error:", message);
      });

      player.addListener("authentication_error", ({ message }: any) => {
        console.error("Auth error:", message);
      });

      player.addListener("account_error", ({ message }: any) => {
        console.error("Account error:", message);
      });

      player.connect();
      playerRef.current = player;
    };

    return () => {
      playerRef.current?.disconnect();
      document.body.removeChild(script);
    };
    // Only run once on mount with the initial token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Sync volume changes
  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

  return { player: playerRef, setOnTrackEnd };
}
