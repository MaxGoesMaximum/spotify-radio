"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpotifyTrack } from "@/types";
import { useRadioStore } from "@/store/radio-store";
import { playTrack, SpotifyAuthError } from "@/services/spotify-api";
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
  setDiscoveryMode,
  selectNextTrackForCustom,
  getLastTrackBreakdown,
  setTemporaryFilter,
  clearTemporaryFilter,
  setTimeMachineDecade as setTimeMachineDecadeSelector,
} from "@/services/music-selector";
import { parseDJRequest } from "@/services/dj/request-parser";
import { fetchLyrics } from "@/services/lyrics";
import { getStation } from "@/config/stations";
import {
  getSongsUntilAnnouncement,
  resetScheduler,
} from "@/services/dj/scheduler";
import { buildUserContext } from "@/services/dj/user-context";

export function useRadioEngine(
  accessToken: string | undefined,
  onAuthError?: () => void
) {
  const store = useRadioStore();
  const isProcessingRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Get the station config for DJ voice/tone
  const station = getStation(store.currentGenre);

  // Fetch lyrics for a track (async, fire-and-forget)
  const fetchTrackLyrics = useCallback((track: SpotifyTrack) => {
    if (!useRadioStore.getState().lyricsEnabled) return;
    store.setCurrentLyrics(null); // Clear previous lyrics
    fetchLyrics(track.name, track.artists[0]?.name, track.duration_ms)
      .then((lyrics) => {
        // Only set if track is still current
        const current = useRadioStore.getState().currentTrack;
        if (current?.id === track.id) {
          store.setCurrentLyrics(lyrics);
        }
      })
      .catch(() => { });
  }, [store]);

  // Track mood point from a track (uses popularity as proxy for audio features)
  const trackMoodPoint = useCallback((track: SpotifyTrack) => {
    const pop = (track.popularity ?? 50) / 100;
    // Estimate mood from popularity — higher popularity tends to be more energetic/danceable
    store.addMoodPoint({
      energy: Math.min(1, pop * 0.9 + Math.random() * 0.1),
      valence: Math.min(1, pop * 0.7 + 0.15 + Math.random() * 0.15),
      danceability: Math.min(1, pop * 0.8 + 0.1 + Math.random() * 0.1),
    });
  }, [store]);

  // Build user context for personalized DJ announcements
  const getUserContext = useCallback(() => {
    return buildUserContext(store.userName);
  }, [store.userName]);

  const playNextTrack = useCallback(async () => {
    if (!accessToken || !store.deviceId || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // Use the smart music selector — route through custom station if active
      const activeCustom = store.activeCustomStationId
        ? store.customStations.find((s) => s.id === store.activeCustomStationId)
        : null;

      const nextTrack = activeCustom
        ? await selectNextTrackForCustom(activeCustom, accessToken)
        : await selectNextTrack(store.currentGenre, accessToken);

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
          userContext: getUserContext(),
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

      // Fetch live deviceId in case it changed due to a reconnect during TTS
      const activeDeviceId = useRadioStore.getState().deviceId;
      if (!activeDeviceId) {
        isProcessingRef.current = false;
        return;
      }

      // Play the next track
      const success = await playTrack(
        accessToken,
        activeDeviceId,
        nextTrack.uri
      );
      if (success) {
        store.setCurrentTrack(nextTrack);
        store.setCurrentTrackBreakdown(getLastTrackBreakdown());
        store.setPlaying(true);
        store.incrementSessionTrackCount();
        trackMoodPoint(nextTrack);
        fetchTrackLyrics(nextTrack);

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
          userContext: getUserContext(),
        });
        preloadTTS(preloadText, station.djProfile.voice, station.djProfile.rate, station.djProfile.pitch).catch(() => { });
      }
    } catch (error) {
      if (error instanceof SpotifyAuthError) {
        console.warn("[RadioEngine] Token expired, triggering refresh...");
        onAuthError?.();
      } else {
        console.error("Radio engine error:", error);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [accessToken, store, station, onAuthError]);

  const startRadio = useCallback(async () => {
    if (!accessToken || !store.deviceId || hasStartedRef.current) return;
    hasStartedRef.current = true;
    store.setLoading(true);

    try {
      // Select first track via smart selector
      const activeCustom = store.activeCustomStationId
        ? store.customStations.find((s) => s.id === store.activeCustomStationId)
        : null;

      const firstTrack = activeCustom
        ? await selectNextTrackForCustom(activeCustom, accessToken)
        : await selectNextTrack(store.currentGenre, accessToken);

      if (firstTrack) {
        store.setAnnouncerSpeaking(true);
        store.setCurrentSegment("intro");

        const introScript = generateScript("intro", { nextTrack: firstTrack, stationId: store.currentGenre, userContext: getUserContext() });
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

        // IMPORTANT: fetch the absolute latest device_id from State because the
        // player might have re-initialized asynchronously while we were speaking!
        const activeDeviceId = useRadioStore.getState().deviceId;
        if (!activeDeviceId) return;

        const success = await playTrack(accessToken, activeDeviceId, firstTrack.uri);

        if (success) {
          store.setCurrentTrack(firstTrack);
          store.setCurrentTrackBreakdown(getLastTrackBreakdown());
          store.setPlaying(true);
          store.incrementSessionTrackCount();
          trackMoodPoint(firstTrack);
          fetchTrackLyrics(firstTrack);
        } else {
          console.error("Critical: Initial Spotify playback failed. 404 Race Condition?");
          store.setLoading(false);
          hasStartedRef.current = false; // Allow manual retry by unsetting the lock
        }
      }
    } catch (error) {
      if (error instanceof SpotifyAuthError) {
        console.warn("[RadioEngine] Token expired during startup, triggering refresh...");
        onAuthError?.();
      } else {
        console.error("Radio start error:", error);
      }
      hasStartedRef.current = false;
    }

    store.setLoading(false);
  }, [accessToken, store.deviceId, station, onAuthError]);

  const skipTrack = useCallback((penalize = true) => {
    // Track the skip for taste profile
    if (penalize && store.currentTrack) {
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
      store.setActiveCustomStation(null);
      clearCandidatePool();
      resetScheduler();
      hasStartedRef.current = false;
      isProcessingRef.current = false;

      if (accessToken && store.deviceId) {
        try {
          const newStation = getStation(genre);

          // Select first track for the new station
          const firstTrack = await selectNextTrack(genre, accessToken);

          if (firstTrack) {
            store.setAnnouncerSpeaking(true);
            store.setCurrentSegment("station_id");

            try {
              const stationScript = generateScript("station_id", { stationId: genre, userContext: getUserContext() });
              const transitionScript = generateScript("between", {
                nextTrack: firstTrack,
                stationId: genre,
                userContext: getUserContext(),
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
            store.setCurrentTrackBreakdown(getLastTrackBreakdown());
            store.setPlaying(true);
            store.incrementSessionTrackCount();
            trackMoodPoint(firstTrack);
            fetchTrackLyrics(firstTrack);
          }
        } catch (error) {
          if (error instanceof SpotifyAuthError) {
            console.warn("[RadioEngine] Token expired during genre change, triggering refresh...");
            onAuthError?.();
          } else {
            console.error("Genre change error:", error);
          }
        }
      }
    },
    [accessToken, store, onAuthError]
  );

  // Handle DJ request from user
  const handleDJRequest = useCallback(async (text: string) => {
    if (!accessToken || !store.deviceId) return;

    const request = parseDJRequest(text);
    if (!request) return;

    // Store the active request for UI display
    store.setActiveRequest(request);

    // Apply temporary filter to music selector
    setTemporaryFilter({
      yearRange: request.yearRange,
      genreBoost: request.genreBoost,
      energyRange: request.energyRange,
      artistSearch: request.artistSearch,
      expiresAfterTracks: request.expiresAfterTracks,
    });

    // DJ acknowledges the request via TTS
    store.setAnnouncerSpeaking(true);
    store.setCurrentSegment("request_ack");

    try {
      const ackScript = generateScript("request_ack", {
        stationId: store.currentGenre,
        userContext: getUserContext(),
        requestLabel: request.label,
      });

      const { speak } = await import("@/services/speech");
      await speak(
        ackScript,
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

    // Skip to next track (which will now use the filter)
    playNextTrack();

    // Auto-clear the active request display after the filter expires
    setTimeout(() => {
      store.setActiveRequest(null);
    }, request.expiresAfterTracks * 180000); // Rough estimate: ~3min per track
  }, [accessToken, store, station, playNextTrack]);

  // Clear DJ request handler
  const clearDJRequest = useCallback(() => {
    clearTemporaryFilter();
    store.setActiveRequest(null);
  }, [store]);

  // Activate/deactivate time machine
  const activateTimeMachine = useCallback(async (decade: number | null) => {
    if (!accessToken || !store.deviceId) return;

    // Update store and music selector
    store.setTimeMachineDecade(decade);
    setTimeMachineDecadeSelector(decade);

    // DJ announces the time travel
    store.setAnnouncerSpeaking(true);
    store.setCurrentSegment("time_machine");

    try {
      // Pre-select the next track so DJ can announce it
      const activeCustom = store.activeCustomStationId
        ? store.customStations.find((s) => s.id === store.activeCustomStationId)
        : null;

      const nextTrack = activeCustom
        ? await selectNextTrackForCustom(activeCustom, accessToken)
        : await selectNextTrack(store.currentGenre, accessToken);

      const tmScript = generateScript("time_machine", {
        stationId: store.currentGenre,
        userContext: getUserContext(),
        timeMachineDecade: decade ?? undefined,
        nextTrack,
      });

      const { speak } = await import("@/services/speech");
      await speak(
        tmScript,
        0.9,
        station.djProfile.voice,
        station.djProfile.rate,
        station.djProfile.pitch
      );

      store.setAnnouncerSpeaking(false);
      store.setCurrentSegment(null);

      // Play the selected track
      if (nextTrack) {
        const activeDeviceId = useRadioStore.getState().deviceId;
        if (activeDeviceId) {
          const success = await playTrack(accessToken, activeDeviceId, nextTrack.uri);
          if (success) {
            store.setCurrentTrack(nextTrack);
            store.setCurrentTrackBreakdown(getLastTrackBreakdown());
            store.setPlaying(true);
            store.incrementSessionTrackCount();
            trackMoodPoint(nextTrack);
            fetchTrackLyrics(nextTrack);
          }
        }
      }
    } catch {
      store.setAnnouncerSpeaking(false);
      store.setCurrentSegment(null);
      // Fallback: just play next track without announcement
      playNextTrack();
    }
  }, [accessToken, store, station, playNextTrack]);

  // Refetch lyrics when lyrics are toggled on while a track is playing
  useEffect(() => {
    if (store.lyricsEnabled && store.currentTrack && !store.currentLyrics) {
      fetchTrackLyrics(store.currentTrack);
    }
    if (!store.lyricsEnabled) {
      store.setCurrentLyrics(null);
    }
  }, [store.lyricsEnabled, store.currentTrack, store.currentLyrics, fetchTrackLyrics, store]);

  // Sync discovery mode to music-selector singleton
  useEffect(() => {
    setDiscoveryMode(store.discoveryMode);
  }, [store.discoveryMode]);

  // Listener count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const current = useRadioStore.getState().listenerCount;
      const delta = Math.floor(Math.random() * 11) - 5;
      store.setListenerCount(Math.max(800, current + delta));
    }, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { startRadio, playNextTrack, skipTrack, changeGenre, handleDJRequest, clearDJRequest, activateTimeMachine };
}
