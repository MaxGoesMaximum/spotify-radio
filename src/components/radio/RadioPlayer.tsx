"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useRadioEngine } from "@/hooks/useRadioEngine";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useNews } from "@/hooks/useNews";
import { useAutoReconnect } from "@/hooks/useAutoReconnect";
import { useTrackNotifications } from "@/hooks/useTrackNotifications";
import { GlassCard } from "@/components/ui/GlassCard";
import { VinylRecord } from "./VinylRecord";
import { Visualizer } from "./Visualizer";
import { NowPlaying } from "./NowPlaying";
import StationDial from "./StationDial";
import { VolumeKnob } from "./VolumeKnob";
import { OnAirIndicator } from "./OnAirIndicator";
import { WeatherWidget } from "./WeatherWidget";
import { NewsWidget } from "./NewsWidget";
import { TimeDisplay } from "./TimeDisplay";
import { DJAvatar } from "./DJAvatar";
import { SongHistory } from "./SongHistory";
import { ListenerCount } from "./ListenerCount";
import { SleepTimer } from "./SleepTimer";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { EQPresets } from "./EQPresets";
import { SessionStats } from "./SessionStats";
import { QueuePreview } from "./QueuePreview";
import { SongProgressBar } from "./SongProgressBar";
import { SongReactions } from "./SongReactions";
import { FullscreenPlayer } from "./FullscreenPlayer";
import { VisualizerStyleSelector } from "./VisualizerStyleSelector";
import { CustomStationBuilder } from "./CustomStationBuilder";
import { DJRequestInput } from "./DJRequestInput";
import { TimeMachine } from "./TimeMachine";
import { MoodRadar } from "./MoodRadar";
import { LiveLyrics } from "./LiveLyrics";
import { pausePlayback, resumePlayback, SpotifyAuthError } from "@/services/spotify-api";
import { getStationColor } from "@/config/stations";
import { useToastStore } from "@/store/toast-store";

interface RadioPlayerProps {
  accessToken: string;
}

export function RadioPlayer({ accessToken }: RadioPlayerProps) {
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const isConnected = useRadioStore((s) => s.isConnected);
  const isLoading = useRadioStore((s) => s.isLoading);
  const deviceId = useRadioStore((s) => s.deviceId);
  const setPlaying = useRadioStore((s) => s.setPlaying);
  const currentGenre = useRadioStore((s) => s.currentGenre);
  const discoveryMode = useRadioStore((s) => s.discoveryMode);
  const toggleDiscoveryMode = useRadioStore((s) => s.toggleDiscoveryMode);
  const activeCustomStationId = useRadioStore((s) => s.activeCustomStationId);
  const addToast = useToastStore((s) => s.addToast);

  const [genreColor, setGenreColor] = useState(getStationColor(currentGenre));
  const [isCustomStationOpen, setIsCustomStationOpen] = useState(false);

  useEffect(() => {
    if (activeCustomStationId) {
      const custom = useRadioStore.getState().customStations.find((s) => s.id === activeCustomStationId);
      if (custom) {
        setGenreColor(custom.color);
        return;
      }
    }

    setGenreColor(getStationColor(currentGenre));

    const handleColorChange = (e: Event) => {
      const { genre, color } = (e as CustomEvent).detail;
      if (genre === currentGenre || genre === "all") {
        setGenreColor(color);
      }
    };

    window.addEventListener("stationColorChange", handleColorChange);
    return () => window.removeEventListener("stationColorChange", handleColorChange);
  }, [currentGenre, activeCustomStationId]);

  const { setOnTrackEnd } = useSpotifyPlayer(accessToken);
  const { startRadio, playNextTrack, skipTrack, changeGenre, handleDJRequest, clearDJRequest, activateTimeMachine } =
    useRadioEngine(accessToken, handleAuthError);

  // Auth error handler — triggers session refresh
  function handleAuthError() {
    console.warn("[RadioPlayer] Auth error, refreshing session...");
    // The session provider will auto-refresh on next poll;
    // force an immediate refresh by reloading the session endpoint
    fetch("/api/spotify/session").catch(() => { });
  }

  // Initialize data hooks
  useGeolocation();
  useWeather();
  useNews();

  // Auto-reconnect on disconnect
  const { isReconnecting, reconnectAttempts, maxAttempts } = useAutoReconnect(accessToken);

  // Browser notifications on track change
  const { requestPermission: requestNotifPermission, notificationsEnabled } = useTrackNotifications();

  // Set up track end handler
  useEffect(() => {
    setOnTrackEnd(() => {
      playNextTrack();
    });
  }, [setOnTrackEnd, playNextTrack]);

  // Auto-start radio when connected
  useEffect(() => {
    if (isConnected && deviceId && accessToken) {
      startRadio();
    }
  }, [isConnected, deviceId, accessToken, startRadio]);

  const handlePlayPause = async () => {
    if (!accessToken || !deviceId) return;
    try {
      if (isPlaying) {
        await pausePlayback(accessToken);
        setPlaying(false);
      } else {
        await resumePlayback(accessToken, deviceId);
        setPlaying(true);
      }
    } catch (error) {
      if (error instanceof SpotifyAuthError) {
        handleAuthError();
      } else {
        console.error("Play/pause error:", error);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <GlassCard className="p-8 sm:p-12 text-center max-w-md w-full">
          <div className="space-y-8">
            {/* Skeleton icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[3px] border-white/5 border-t-radio-accent animate-spin" />
              <div className="absolute inset-4 rounded-full bg-radio-accent/5 backdrop-blur-md animate-pulse flex items-center justify-center">
                <svg className="w-8 h-8 text-radio-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isReconnecting ? "Opnieuw verbinden..." : "Verbinden met Spotify..."}
              </h2>
              <div className="space-y-2 max-w-[80%] mx-auto">
                <p className="text-white/40 text-sm leading-relaxed">
                  {isReconnecting
                    ? `Poging ${reconnectAttempts}/${maxAttempts} — Even geduld...`
                    : "Je Spotify Premium account wordt beveiligd gekoppeld..."
                  }
                </p>
                {/* Skeleton progress bars */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-radio-accent/20 via-radio-accent/80 to-radio-glow/20"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-3"
    >
      {/* ═══ Status Bar ═══ */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-y-2">
        {/* Left: Status indicators */}
        <div className="flex items-center gap-3">
          <OnAirIndicator />
          <div className="hidden sm:block w-px h-4 bg-white/[0.06]" />
          <ListenerCount />
        </div>

        {/* Center: Clock */}
        <div className="hidden sm:block">
          <TimeDisplay />
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <EQPresets />
          <QueuePreview />
          <SleepTimer accessToken={accessToken} />
          <SongHistory accessToken={accessToken} />
          <WeatherWidget />

          {/* Notification toggle */}
          <motion.button
            onClick={requestNotifPermission}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${notificationsEnabled
              ? "bg-radio-accent/10 border-radio-accent/25 text-radio-accent"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
              }`}
            title={notificationsEnabled ? "Meldingen aan" : "Meldingen inschakelen"}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </motion.button>

          {/* Discovery mode toggle */}
          <motion.button
            onClick={() => {
              toggleDiscoveryMode();
              addToast(
                !discoveryMode ? "Ontdekkingsmodus ingeschakeld — meer nieuwe muziek!" : "Ontdekkingsmodus uitgeschakeld",
                !discoveryMode ? "success" : "info",
                3000
              );
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${discoveryMode
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
              }`}
            title={discoveryMode ? "Ontdekkingsmodus aan" : "Ontdekkingsmodus"}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="text-xs hidden sm:inline">Ontdekken</span>
          </motion.button>

          {/* Time Machine */}
          <TimeMachine onActivate={activateTimeMachine} />

          {/* Custom station builder */}
          <motion.button
            onClick={() => setIsCustomStationOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${activeCustomStationId
              ? "bg-purple-500/10 border-purple-500/25 text-purple-400"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
              }`}
            title="Eigen zender bouwen"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-xs hidden sm:inline">Eigen zender</span>
          </motion.button>

          <KeyboardShortcuts
            onPlayPause={handlePlayPause}
            onSkip={() => skipTrack()}
            onStationChange={changeGenre}
          />
        </div>
      </div>

      {/* Custom Station Builder Modal */}
      <AnimatePresence>
        {isCustomStationOpen && (
          <CustomStationBuilder
            onClose={() => setIsCustomStationOpen(false)}
            onStationCreated={() => skipTrack(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ FM Dial Tuner ═══ */}
      <GlassCard className="p-3 sm:p-4">
        <StationDial onStationChange={changeGenre} />
      </GlassCard>

      {/* ═══ Main Player Card ═══ */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <GlassCard className="p-4 sm:p-5 lg:p-7">
          {/* Vinyl + Now Playing side-by-side */}
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            {/* Vinyl + DJ Avatar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex-shrink-0"
            >
              <VinylRecord />
              {/* DJ Avatar overlay when speaking */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                <DJAvatar />
              </div>
            </motion.div>

            {/* Now Playing info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 w-full min-w-0"
            >
              <NowPlaying accessToken={accessToken} />
            </motion.div>
          </div>

          {/* ═══ Visualizer ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 sm:mt-5"
          >
            <Visualizer />
          </motion.div>

          {/* ═══ Song Progress Bar ═══ */}
          <SongProgressBar />

          {/* ═══ Song Reactions ═══ */}
          <SongReactions />

          {/* ═══ Transport Controls ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-white/[0.04]"
          >
            {/* Play/Pause — primary action */}
            <motion.button
              onClick={handlePlayPause}
              disabled={isLoading}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl disabled:opacity-50 transition-all duration-300 group"
              style={{
                background: `linear-gradient(135deg, ${genreColor}, ${genreColor}bb)`,
                boxShadow: `0 4px 30px ${genreColor}35, inset 0 1px 0 rgba(255,255,255,0.15)`,
              }}
              aria-label={isPlaying ? "Pauzeren" : "Afspelen"}
            >
              {/* Hover ring */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: `0 0 0 3px ${genreColor}30` }}
              />

              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.button>

            {/* Skip */}
            <motion.button
              onClick={() => skipTrack()}
              disabled={isLoading || !isPlaying}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 sm:p-4 rounded-full text-white/50 hover:text-white/90 hover:bg-white/[0.08] disabled:opacity-30 transition-all border border-transparent hover:border-white/[0.05]"
              aria-label="Volgend nummer (Sneltoets: Pijltje Rechts)"
              title="Volgend nummer (Sneltoets: →)"
            >
              <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2 0V6l6.5 6L8 18zm8-12v12h2V6h-2z" />
              </svg>
            </motion.button>

            {/* Divider */}
            <div className="w-px h-8 bg-white/[0.06] hidden sm:block" />

            {/* Visualizer Style */}
            <VisualizerStyleSelector />

            {/* Fullscreen */}
            <FullscreenPlayer />

            {/* Volume */}
            <VolumeKnob />
          </motion.div>

          {/* ═══ DJ Request Input & Lyrics Toggle ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-3 pt-3 border-t border-white/[0.04] space-y-2"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <DJRequestInput onSubmit={handleDJRequest} onClear={clearDJRequest} />
              </div>
              <LiveLyrics />
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>

      {/* ═══ News Ticker ═══ */}
      <NewsWidget />

      {/* ═══ Session Stats & Mood Radar ═══ */}
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <div className="flex-1 w-full">
          <SessionStats />
        </div>
        <MoodRadar />
      </div>
    </motion.div>
  );
}
