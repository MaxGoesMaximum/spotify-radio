"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRadioStore } from "@/store/radio-store";
import { playTrack } from "@/services/spotify-api";
import {
  generateScript,
  generateMultiSegment,
  pickAnnouncementType,
} from "@/services/dj-scripts";
import { stopSpeaking, preloadTTS } from "@/services/speech";
import { audioCoordinator } from "@/services/audio-coordinator";
import {
  selectNextTrack,
  updateTasteProfile,
  clearCandidatePool,
} from "@/services/music-selector";
import { getStation } from "@/config/stations";
import {
  getSongsUntilAnnouncement,
  resetScheduler,
} from "@/services/dj/scheduler";

export function useRadioEngine(accessToken: string | undefined) {
  const store = useRadioStore();
  const isProcessingRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Get the station config for DJ voice/tone
  const station = getStation(store.currentGenre);

  const playNextTrack = useCallback(async () => {
    if (!accessToken || !store.deviceId || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // Use the smart music selector instead of raw queue
      const nextTrack = await selectNextTrack(
        store.currentGenre,
        accessToken
      );

      if (!nextTrack) {
        console.warn("No track found for station:", store.currentGenre);
        isProcessingRef.current = false;
        return;
      }

      // Check if it's announcement time
      if (store.songsUntilAnnouncement <= 0) {
        store.setAnnouncerSpeaking(true);

        const scriptType = pickAnnouncementType(
          store.songsSinceAnnouncement,
          !!store.weather,
          store.news.length > 0,
          store.currentGenre
        );

        store.setCurrentSegment(scriptType);

        // Generate multi-segment (may include jingle prefix)
        const segments = generateMultiSegment(scriptType, {
          previousTrack: store.currentTrack,
          nextTrack,
          weather: store.weather,
          news: store.news,
          stationId: store.currentGenre,
        });

        try {
          // Use station-specific DJ voice
          await audioCoordinator.playSegments(
            segments.map((text) => ({ text })),
            accessToken,
            store.deviceId!,
            store.volume,
            {
              voice: station.djProfile.voice,
              rate: station.djProfile.rate,
              pitch: station.djProfile.pitch,
            }
          );
        } catch {
          // Speech failed, continue anyway
        }

        store.setAnnouncerSpeaking(false);
        store.setCurrentSegment(null);

        let baseCount = getSongsUntilAnnouncement(store.currentGenre);
        if (store.djFrequency === "low") baseCount += 2; // Speeks less frequently
        if (store.djFrequency === "high") baseCount = Math.max(1, baseCount - 1); // Speaks more frequently

        store.setSongsUntilAnnouncement(baseCount);
      } else {
        store.decrementSongsUntilAnnouncement();
      }

      // Add previous track to history (local + DB)
      if (store.currentTrack) {
        store.addToHistory(store.currentTrack, store.currentGenre);
        // Persist to database (fire-and-forget)
        fetch("/api/user/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackId: store.currentTrack.id,
            trackName: store.currentTrack.name,
            artistName: store.currentTrack.artists.map((a) => a.name).join(", "),
            albumName: store.currentTrack.album.name,
            albumImage: store.currentTrack.album.images?.[0]?.url || null,
            genre: store.currentGenre,
            durationMs: store.currentTrack.duration_ms,
          }),
        }).catch(() => { });
      }

      // Play the next track
      const success = await playTrack(
        accessToken,
        store.deviceId,
        nextTrack.uri
      );
      if (success) {
        store.setCurrentTrack(nextTrack);
        store.setPlaying(true);
        store.incrementSessionTrackCount();

        // Preload next announcement while song plays
        const nextScriptType = pickAnnouncementType(
          store.songsSinceAnnouncement + 1,
          !!store.weather,
          store.news.length > 0,
          store.currentGenre
        );
        const preloadText = generateScript(nextScriptType, {
          previousTrack: nextTrack,
          weather: store.weather,
          news: store.news,
          stationId: store.currentGenre,
        });
        preloadTTS(preloadText, station.djProfile.voice, station.djProfile.rate, station.djProfile.pitch).catch(() => { });
      }
    } catch (error) {
      console.error("Radio engine error:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [accessToken, store, station]);

  const startRadio = useCallback(async () => {
    if (!accessToken || !store.deviceId || hasStartedRef.current) return;
    hasStartedRef.current = true;
    store.setLoading(true);

    // Select first track via smart selector
    const firstTrack = await selectNextTrack(
      store.currentGenre,
      accessToken
    );

    if (firstTrack) {
      store.setAnnouncerSpeaking(true);
      store.setCurrentSegment("intro");

      const introScript = generateScript("intro", { nextTrack: firstTrack, stationId: store.currentGenre });
      try {
        const { speak } = await import("@/services/speech");
        await speak(
          introScript,
          0.9,
          station.djProfile.voice,
          station.djProfile.rate,
          station.djProfile.pitch
        );
      } catch {
        // Continue without speech
      }

      store.setAnnouncerSpeaking(false);
      store.setCurrentSegment(null);
      store.setSongsUntilAnnouncement(
        getSongsUntilAnnouncement(store.currentGenre)
      );

      await playTrack(accessToken, store.deviceId, firstTrack.uri);
      store.setCurrentTrack(firstTrack);
      store.setPlaying(true);
      store.incrementSessionTrackCount();
    }

    store.setLoading(false);
  }, [accessToken, store.deviceId, station]);

  const skipTrack = useCallback(() => {
    // Track the skip for taste profile
    if (store.currentTrack) {
      updateTasteProfile("skip", store.currentTrack);
      store.incrementSkipCount();
    }

    stopSpeaking();
    audioCoordinator.stop();
    store.setAnnouncerSpeaking(false);
    store.setCurrentSegment(null);
    playNextTrack();
  }, [playNextTrack, store.currentTrack]);

  const changeGenre = useCallback(
    async (genre: typeof store.currentGenre) => {
      stopSpeaking();
      audioCoordinator.stop();
      store.setAnnouncerSpeaking(false);
      store.setCurrentSegment(null);
      store.setGenre(genre);
      clearCandidatePool();
      resetScheduler();
      hasStartedRef.current = false;
      isProcessingRef.current = false;

      if (accessToken && store.deviceId) {
        const newStation = getStation(genre);

        // Select first track for the new station
        const firstTrack = await selectNextTrack(genre, accessToken);

        if (firstTrack) {
          store.setAnnouncerSpeaking(true);
          store.setCurrentSegment("station_id");

          try {
            const stationScript = generateScript("station_id", { stationId: genre });
            const transitionScript = generateScript("between", {
              nextTrack: firstTrack,
              stationId: genre,
            });

            await audioCoordinator.playSegments(
              [{ text: stationScript }, { text: transitionScript }],
              accessToken,
              store.deviceId!,
              store.volume,
              {
                voice: newStation.djProfile.voice,
                rate: newStation.djProfile.rate,
                pitch: newStation.djProfile.pitch,
              }
            );
          } catch { }

          store.setAnnouncerSpeaking(false);
          store.setCurrentSegment(null);
          store.setSongsUntilAnnouncement(
            getSongsUntilAnnouncement(genre)
          );

          await playTrack(accessToken, store.deviceId, firstTrack.uri);
          store.setCurrentTrack(firstTrack);
          store.setPlaying(true);
          store.incrementSessionTrackCount();
        }
      }
    },
    [accessToken, store]
  );

  // Listener count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 11) - 5;
      store.setListenerCount(Math.max(800, store.listenerCount + delta));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return { startRadio, playNextTrack, skipTrack, changeGenre };
}
