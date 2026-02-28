"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { formatTime } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { getStation } from "@/config/stations";
import { checkSavedTracks } from "@/services/spotify-api";
import { FavoritesButton } from "./FavoritesButton";
import { ShareButton } from "./ShareButton";

interface NowPlayingProps {
  accessToken: string;
}

/** Auto-scrolling marquee for text that overflows */
function Marquee({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    const check = () => {
      if (containerRef.current && textRef.current) {
        setNeedsScroll(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className || ""}`}>
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap ${needsScroll ? "animate-slide-left" : ""
          }`}
        style={needsScroll ? { animationDuration: `${Math.max(8, text.length * 0.25)}s` } : undefined}
      >
        {text}
        {needsScroll && <span className="mx-12 text-white/20">\u2022</span>}
        {needsScroll && text}
      </span>
    </div>
  );
}

export function NowPlaying({ accessToken }: NowPlayingProps) {
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);
  const currentGenre = useRadioStore((s) => s.currentGenre);
  const incrementDiscoveredCount = useRadioStore((s) => s.incrementDiscoveredCount);
  const [isNewTrack, setIsNewTrack] = useState<boolean | null>(null);

  const station = getStation(currentGenre);

  // Check if current track is new to the user's library
  useEffect(() => {
    if (!currentTrack || !accessToken) return;
    let cancelled = false;
    setIsNewTrack(null);

    checkSavedTracks(accessToken, [currentTrack.id])
      .then(([isSaved]) => {
        if (cancelled) return;
        setIsNewTrack(!isSaved);
        if (!isSaved) incrementDiscoveredCount();
      })
      .catch(() => { /* non-critical */ });

    return () => { cancelled = true; };
  }, [currentTrack?.id, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentTrack) {
    return (
      <div className="text-center lg:text-left py-10">
        <div className="space-y-3">
          <div className="w-10 h-10 mx-auto lg:mx-0 rounded-full bg-white/[0.03] flex items-center justify-center">
            <svg className="w-5 h-5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z" />
            </svg>
          </div>
          <p className="text-white/20 text-sm">Selecteer een zender om te beginnen</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTrack.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="text-center lg:text-left space-y-2.5"
        role="status"
        aria-live="polite"
        aria-label={`Now playing: ${currentTrack.name} by ${currentTrack.artists.map((a) => a.name).join(", ")}`}
      >
        {/* Station tag + status */}
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
            style={{
              color: station.color,
              borderColor: `${station.color}25`,
              backgroundColor: `${station.color}08`,
            }}
          >
            <span>{station.icon}</span>
            {station.label}
          </span>

          {/* Discovery badge */}
          {isNewTrack && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            >
              Nieuw
            </motion.span>
          )}

          {/* Playing status indicator */}
          {isPlaying && (
            <div className="flex items-center gap-1.5">
              {isAnnouncerSpeaking ? (
                <>
                  <div className="flex gap-[2px] items-center">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] rounded-full"
                        style={{ backgroundColor: station.color }}
                        animate={{
                          height: ["3px", "12px", "6px", "10px", "3px"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-widest font-medium"
                    style={{ color: `${station.color}cc` }}
                  >
                    DJ aan het woord
                  </span>
                </>
              ) : (
                <>
                  <div className="flex gap-[2px]">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-radio-green rounded-full animate-eq-bar"
                        style={{
                          height: "10px",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-medium text-radio-green/60">
                    Nu aan het spelen
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Track name — with marquee for long names */}
        <Marquee
          text={currentTrack.name}
          className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight max-w-lg mx-auto lg:mx-0"
        />

        {/* Artist */}
        <p className="text-white/45 text-base sm:text-lg font-light tracking-wide truncate max-w-lg mx-auto lg:mx-0">
          {currentTrack.artists.map((a) => a.name).join(", ")}
        </p>

        {/* Album — subtle */}
        <p className="text-white/20 text-xs truncate max-w-md mx-auto lg:mx-0">
          {currentTrack.album.name}
        </p>

        {/* Actions row */}
        <div className="flex items-center justify-center lg:justify-start gap-1 pt-0.5">
          <FavoritesButton accessToken={accessToken} />
          <ShareButton />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
