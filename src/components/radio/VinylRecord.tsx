"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { getStationColor } from "@/config/stations";

export function VinylRecord() {
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);
  const currentGenre = useRadioStore((s) => s.currentGenre);

  const albumUrl = currentTrack?.album?.images?.[0]?.url;
  const spinning = isPlaying && !isAnnouncerSpeaking;
  const genreColor = getStationColor(currentGenre);

  const tonearmRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const rotationRef = useRef(0);
  const lastSpinning = useRef(spinning);
  const isSpinningRef = useRef(spinning);

  // Sync spinning ref for the DOM subscription
  useEffect(() => {
    isSpinningRef.current = spinning;

    // Smooth insertion/retraction of tonearm when playback status changes
    if (tonearmRef.current) {
      tonearmRef.current.style.transition = spinning
        ? "transform 2s ease-out"
        : "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)";

      if (!spinning) {
        tonearmRef.current.style.transform = `rotate(-50deg)`;
      }
    }
  }, [spinning]);

  // Handle spin start/stop with deceleration
  useEffect(() => {
    if (spinning && !lastSpinning.current) {
      // Start spinning
      controls.start({
        rotate: [rotationRef.current, rotationRef.current + 360],
        transition: {
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          },
        },
      });
    } else if (!spinning && lastSpinning.current) {
      // Decelerate to stop
      controls.start({
        rotate: rotationRef.current + 60,
        transition: {
          duration: 2,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    }
    lastSpinning.current = spinning;
  }, [spinning, controls]);

  // Start spinning on mount if already playing
  useEffect(() => {
    if (spinning) {
      controls.start({
        rotate: [0, 360],
        transition: {
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to progress changes OUTSIDE of React renders to directly mutate the Tonearm DOM
  useEffect(() => {
    const unsub = useRadioStore.subscribe((state) => {
      if (!tonearmRef.current || !isSpinningRef.current) return;
      const progressPercent = state.duration > 0 ? state.progress / state.duration : 0;
      const tonearmAngle = -42 + progressPercent * 18;
      tonearmRef.current.style.transform = `rotate(${tonearmAngle}deg)`;
    });
    return unsub;
  }, []);

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 mx-auto lg:mx-0 flex-shrink-0">
      {/* Shadow */}
      <div className="absolute inset-4 rounded-full bg-black/40 blur-2xl" />

      {/* Vinyl disc */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={controls}
        onUpdate={(latest) => {
          if (typeof latest.rotate === "number") {
            rotationRef.current = latest.rotate % 360;
          }
        }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl border border-white/5">
          {/* Grooves */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                inset: `${10 + i * 5}%`,
                border: `1px solid rgba(255,255,255,${0.03 + (i % 3 === 0 ? 0.02 : 0)})`,
              }}
            />
          ))}

          {/* Subtle sheen */}
          <div
            className="absolute inset-0 rounded-full opacity-[0.08]"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${genreColor}20, transparent, rgba(100,100,255,0.1), transparent)`,
            }}
          />
        </div>

        {/* Center label with album art */}
        <div className="absolute inset-[28%] rounded-full overflow-hidden border-2 border-gray-700/50 shadow-inner">
          {isAnnouncerSpeaking ? (
            <div className="w-full h-full bg-gradient-to-br from-radio-accent/80 to-radio-glow/80 flex items-center justify-center">
              <motion.svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </motion.svg>
            </div>
          ) : albumUrl ? (
            <img
              src={albumUrl}
              alt="Album art"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-radio-accent to-radio-glow flex items-center justify-center">
              <span className="text-white text-base sm:text-lg font-bold">SR</span>
            </div>
          )}
        </div>

        {/* Center hole */}
        <div className="absolute inset-[47%] rounded-full bg-radio-bg border border-gray-700/50" />
      </motion.div>

      {/* Glow */}
      {spinning && (
        <div
          className="absolute -inset-6 rounded-full blur-2xl animate-glow-pulse -z-10"
          style={{ backgroundColor: `${genreColor}20` }}
        />
      )}

      {/* Tonearm — tracks progress directly via ref */}
      <div
        ref={tonearmRef}
        className="absolute -right-1 -top-2 origin-right z-10"
        style={{
          transform: `rotate(-50deg)`, // Initial paused position
          transition: "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="relative w-20 sm:w-24 h-1">
          <div className="absolute inset-0 bg-gradient-to-l from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-lg" />
          {/* Needle tip */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-3.5 bg-gradient-to-b from-gray-300 to-gray-500 rounded-sm shadow" />
          {/* Pivot */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-500/50 shadow-md" />
        </div>
      </div>
    </div>
  );
}
