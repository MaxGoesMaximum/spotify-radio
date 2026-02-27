"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/store/radio-store";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_DELAY_MS = 2000; // 2s, 4s, 8s, 16s, 32s (exponential backoff)

/**
 * Auto-reconnect hook: detects Spotify disconnection and attempts to
 * re-initialize the player. Uses exponential backoff with a max of 5 retries.
 */
export function useAutoReconnect(accessToken: string | undefined) {
  const isConnected = useRadioStore((s) => s.isConnected);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const deviceId = useRadioStore((s) => s.deviceId);
  const reconnectAttempts = useRadioStore((s) => s.reconnectAttempts);
  const setReconnectAttempts = useRadioStore((s) => s.setReconnectAttempts);
  const setConnected = useRadioStore((s) => s.setConnected);

  const wasConnectedRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Track when we were previously connected
  useEffect(() => {
    if (isConnected && deviceId) {
      wasConnectedRef.current = true;
      setReconnectAttempts(0);
    }
  }, [isConnected, deviceId, setReconnectAttempts]);

  // Detect disconnection
  const attemptReconnect = useCallback(async () => {
    if (!accessToken || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

    const attempt = reconnectAttempts + 1;
    setReconnectAttempts(attempt);

    console.log(`[AutoReconnect] Attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}...`);

    try {
      // Ping Spotify to check if token is still valid
      const res = await fetch("https://api.spotify.com/v1/me/player/devices", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const devices = data.devices || [];
        const webPlayer = devices.find(
          (d: { id: string; type: string }) => d.type === "Computer" || d.id === deviceId
        );

        if (webPlayer) {
          console.log("[AutoReconnect] Device found, reconnected!");
          setConnected(true);
          setReconnectAttempts(0);
          return;
        }
      }
    } catch (err) {
      console.warn("[AutoReconnect] Check failed:", err);
    }

    // Schedule next attempt with exponential backoff
    if (attempt < MAX_RECONNECT_ATTEMPTS) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`[AutoReconnect] Retrying in ${delay / 1000}s...`);
      reconnectTimerRef.current = setTimeout(attemptReconnect, delay);
    } else {
      console.warn("[AutoReconnect] Max attempts reached. Please refresh.");
    }
  }, [accessToken, reconnectAttempts, deviceId, setReconnectAttempts, setConnected]);

  // Monitor connection state — trigger reconnect when we lose it
  useEffect(() => {
    if (wasConnectedRef.current && !isConnected && reconnectAttempts === 0) {
      console.log("[AutoReconnect] Connection lost, starting reconnect...");
      const timer = setTimeout(attemptReconnect, BASE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isConnected, reconnectAttempts, attemptReconnect]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  return {
    isReconnecting: reconnectAttempts > 0 && !isConnected,
    reconnectAttempts,
    maxAttempts: MAX_RECONNECT_ATTEMPTS,
  };
}
