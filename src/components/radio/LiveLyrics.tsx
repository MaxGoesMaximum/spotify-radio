"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { cn } from "@/lib/utils";

export function LiveLyrics() {
  const currentLyrics = useRadioStore((s) => s.currentLyrics);
  const lyricsEnabled = useRadioStore((s) => s.lyricsEnabled);
  const progress = useRadioStore((s) => s.progress);
  const toggleLyrics = useRadioStore((s) => s.toggleLyrics);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find current lyric index based on playback progress
  const currentIndex = useMemo(() => {
    if (!currentLyrics || currentLyrics.length === 0) return -1;
    const progressSeconds = progress / 1000;

    // Find the last lyric that has started
    let idx = -1;
    for (let i = 0; i < currentLyrics.length; i++) {
      if (currentLyrics[i].time <= progressSeconds) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [currentLyrics, progress]);

  // Auto-scroll to current lyric
  useEffect(() => {
    if (currentIndex < 0 || !containerRef.current) return;

    const container = containerRef.current;
    const activeEl = container.querySelector(`[data-lyric-idx="${currentIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  return (
    <div className="relative">
      {/* Lyrics toggle button */}
      <motion.button
        onClick={toggleLyrics}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all",
          lyricsEnabled
            ? "bg-pink-500/10 border-pink-500/25 text-pink-400"
            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        )}
        title={lyricsEnabled ? "Lyrics verbergen" : "Lyrics tonen"}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
        <span className="hidden sm:inline">Lyrics</span>
      </motion.button>

      {/* Lyrics panel */}
      <AnimatePresence>
        {lyricsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <div className="bg-black/30 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 max-h-48 overflow-hidden">
              {!currentLyrics ? (
                <div className="text-center py-4">
                  <p className="text-white/25 text-xs">
                    {lyricsEnabled ? "Lyrics laden..." : "Geen lyrics beschikbaar"}
                  </p>
                </div>
              ) : currentLyrics.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-white/25 text-xs">
                    Geen lyrics gevonden voor dit nummer
                  </p>
                </div>
              ) : (
                <div
                  ref={containerRef}
                  className="overflow-y-auto max-h-40 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
                >
                  {currentLyrics.map((lyric, idx) => (
                    <motion.p
                      key={`${lyric.time}-${idx}`}
                      data-lyric-idx={idx}
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: idx === currentIndex ? 1 : idx < currentIndex ? 0.2 : 0.35,
                        scale: idx === currentIndex ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "text-sm transition-all leading-relaxed px-2 py-0.5 rounded",
                        idx === currentIndex
                          ? "text-white font-medium bg-white/[0.05]"
                          : "text-white/30"
                      )}
                    >
                      {lyric.text}
                    </motion.p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
