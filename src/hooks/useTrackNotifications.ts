"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/store/radio-store";

/**
 * Browser notification on track change.
 * Only fires when the tab is not focused, so the user gets notified
 * of new tracks while multitasking.
 */
export function useTrackNotifications() {
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const notificationsEnabled = useRadioStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useRadioStore((s) => s.setNotificationsEnabled);

  const prevTrackIdRef = useRef<string | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission === "denied") {
      setNotificationsEnabled(false);
      return false;
    }

    const result = await Notification.requestPermission();
    const granted = result === "granted";
    setNotificationsEnabled(granted);
    return granted;
  }, [setNotificationsEnabled]);

  // Initialize — check current permission state
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setNotificationsEnabled(Notification.permission === "granted");
  }, [setNotificationsEnabled]);

  // Send notification on track change (only when tab is not focused)
  useEffect(() => {
    if (!currentTrack || !isPlaying || !notificationsEnabled) return;

    // Only notify on change, not on initial load
    if (prevTrackIdRef.current === null) {
      prevTrackIdRef.current = currentTrack.id;
      return;
    }

    if (currentTrack.id === prevTrackIdRef.current) return;
    prevTrackIdRef.current = currentTrack.id;

    // Only show when tab is not focused
    if (document.hasFocus()) return;

    try {
      const artistNames = currentTrack.artists.map((a) => a.name).join(", ");
      const albumArt = currentTrack.album?.images?.[1]?.url || currentTrack.album?.images?.[0]?.url;

      const notification = new Notification(currentTrack.name, {
        body: artistNames,
        icon: albumArt || "/favicon.ico",
        badge: "/favicon.ico",
        silent: true,
        tag: "spotify-radio-track", // replaces previous notification
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Focus tab on click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Notifications may fail in certain environments
    }
  }, [currentTrack, currentTrack?.id, isPlaying, notificationsEnabled]);

  return { requestPermission, notificationsEnabled };
}
