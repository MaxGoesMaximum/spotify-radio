"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { VinylRecord } from "@/components/radio/VinylRecord";
import { Visualizer } from "@/components/radio/Visualizer";
import { NowPlaying } from "@/components/radio/NowPlaying";
import StationDial from "@/components/radio/StationDial";
import { VolumeKnob } from "@/components/radio/VolumeKnob";
import { OnAirIndicator } from "@/components/radio/OnAirIndicator";
import { WeatherWidget } from "@/components/radio/WeatherWidget";
import { NewsWidget } from "@/components/radio/NewsWidget";
import { TimeDisplay } from "@/components/radio/TimeDisplay";
import type { StationId } from "@/config/stations";
import type { SpotifyTrack } from "@/types";

// Mock data for demo (works with any of the 10 stations)
const MOCK_TRACKS: SpotifyTrack[] = [
  {
    id: "1",
    name: "Avond",
    artists: [{ id: "a1", name: "Boudewijn de Groot" }],
    album: {
      id: "al1",
      name: "Collected",
      images: [
        { url: "https://i.scdn.co/image/ab67616d0000b273a9f6c04ba168640b48aa5795", width: 640, height: 640 },
      ],
      release_date: "1998",
    },
    duration_ms: 245000,
    uri: "spotify:track:mock1",
    preview_url: null,
    popularity: 45,
  },
  {
    id: "2",
    name: "Drank & Drugs",
    artists: [{ id: "a2", name: "Lil Kleine & Ronnie Flex" }],
    album: {
      id: "al2",
      name: "WOP",
      images: [
        { url: "https://i.scdn.co/image/ab67616d0000b2733e5ef85a0e10516e70c29e10", width: 640, height: 640 },
      ],
      release_date: "2015",
    },
    duration_ms: 198000,
    uri: "spotify:track:mock2",
    preview_url: null,
    popularity: 70,
  },
  {
    id: "3",
    name: "Blinding Lights",
    artists: [{ id: "a3", name: "The Weeknd" }],
    album: {
      id: "al3",
      name: "After Hours",
      images: [
        { url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", width: 640, height: 640 },
      ],
      release_date: "2020",
    },
    duration_ms: 200000,
    uri: "spotify:track:mock3",
    preview_url: null,
    popularity: 95,
  },
];

export default function DemoPage() {
  const store = useRadioStore();

  // Initialize demo state
  useEffect(() => {
    store.setCurrentTrack(MOCK_TRACKS[0]);
    store.setPlaying(true);
    store.setConnected(true);
    store.setDeviceId("demo");
    store.setDuration(245000);
    store.setWeather({
      temp: 14,
      feels_like: 12,
      description: "broken clouds",
      icon: "04d",
      city: "Amsterdam",
      country: "NL",
      humidity: 72,
      wind_speed: 15,
    });
    store.setNews([
      {
        title: "Nieuw fietspad geopend in het centrum van Amsterdam",
        description: "De gemeente heeft vandaag een nieuw fietspad geopend.",
        source: "Lokaal Nieuws",
        url: "#",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Zonnepanelen project haalt doelstelling ruimschoots",
        description: "Het gemeentelijke zonnepanelen project is een succes.",
        source: "Duurzaam NL",
        url: "#",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Ajax wint met 3-1 van Feyenoord in De Klassieker",
        description: "Een spectaculaire wedstrijd in de Johan Cruijff ArenA.",
        source: "Sportnieuws",
        url: "#",
        publishedAt: new Date().toISOString(),
      },
    ]);

    // Simulate progress
    const interval = setInterval(() => {
      store.setProgress(store.progress + 1000);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate progress advancing
  useEffect(() => {
    if (!store.isPlaying) return;
    const interval = setInterval(() => {
      const newProgress = store.progress + 1000;
      if (newProgress >= store.duration) {
        // Cycle to next track
        const currentIdx = MOCK_TRACKS.findIndex(
          (t) => t.id === store.currentTrack?.id
        );
        const nextIdx = (currentIdx + 1) % MOCK_TRACKS.length;
        store.setCurrentTrack(MOCK_TRACKS[nextIdx]);
        store.setDuration(MOCK_TRACKS[nextIdx].duration_ms);
        store.setProgress(0);
      } else {
        store.setProgress(newProgress);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [store.isPlaying, store.progress, store.duration, store.currentTrack?.id]);

  const handlePlayPause = () => {
    store.setPlaying(!store.isPlaying);
  };

  const handleSkip = () => {
    const currentIdx = MOCK_TRACKS.findIndex(
      (t) => t.id === store.currentTrack?.id
    );
    const nextIdx = (currentIdx + 1) % MOCK_TRACKS.length;
    store.setCurrentTrack(MOCK_TRACKS[nextIdx]);
    store.setDuration(MOCK_TRACKS[nextIdx].duration_ms);
    store.setProgress(0);
  };

  const handleStationChange = (stationId: StationId) => {
    store.setGenre(stationId);
    // Simulate announcement
    store.setAnnouncerSpeaking(true);
    setTimeout(() => {
      store.setAnnouncerSpeaking(false);
      const randomTrack =
        MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)];
      store.setCurrentTrack(randomTrack);
      store.setDuration(randomTrack.duration_ms);
      store.setProgress(0);
    }, 2000);
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundGradient />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-radio-accent to-radio-glow flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">
            Spotify{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-radio-accent to-radio-glow">
              Radio
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full bg-radio-gold/20 text-radio-gold border border-radio-gold/30">
            DEMO MODE
          </span>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-8">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4">
            <OnAirIndicator />
            <TimeDisplay />
            <WeatherWidget />
          </div>

          {/* Main player card */}
          <GlassCard className="p-8 space-y-8">
            {/* Vinyl + Now Playing */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <VinylRecord />
              <div className="flex-1 w-full">
                <NowPlaying accessToken="demo" />
              </div>
            </div>

            {/* Visualizer */}
            <Visualizer />

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {/* Play/Pause */}
              <motion.button
                onClick={handlePlayPause}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-radio-accent flex items-center justify-center shadow-lg shadow-radio-accent/30"
              >
                {store.isPlaying ? (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.button>

              {/* Skip */}
              <motion.button
                onClick={handleSkip}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18l8.5-6L6 6v12zm2 0V6l6.5 6L8 18zm8-12v12h2V6h-2z" />
                </svg>
              </motion.button>

              {/* Volume */}
              <VolumeKnob />
            </div>
          </GlassCard>

          {/* FM Station Dial (same as main radio page) */}
          <GlassCard className="p-4">
            <StationDial onStationChange={handleStationChange} />
          </GlassCard>

          {/* News Ticker */}
          <NewsWidget />
        </div>
      </main>
    </div>
  );
}
