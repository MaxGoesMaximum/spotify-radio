"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

export function QueuePreview() {
  const [isOpen, setIsOpen] = useState(false);
  const queue = useRadioStore((s) => s.queue);
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside-to-close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const upcoming = queue.slice(0, 5);
  const hasQueue = upcoming.length > 0;

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
          isOpen
            ? "bg-white/[0.08] border-white/[0.12] text-white/60"
            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
        }`}
        title="Wachtrij"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
        <span className="text-xs">Hierna</span>
        {hasQueue && (
          <span className="text-[9px] bg-white/[0.08] px-1.5 py-0.5 rounded-full text-white/30 font-mono">
            {queue.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className="absolute right-0 top-full mt-2 w-[300px] rounded-2xl bg-[#1c1c1e]/98 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-[13px] font-semibold text-white">Komt hierna</span>
                <span className="text-[11px] text-white/25">
                  {queue.length} {queue.length === 1 ? "nummer" : "nummers"}
                </span>
              </div>

              {/* Now Playing mini */}
              {currentTrack && isPlaying && (
                <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    {currentTrack.album?.images?.[0]?.url && (
                      <img
                        src={currentTrack.album.images[0].url}
                        alt=""
                        className="w-8 h-8 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-[2px]">
                          {[...Array(3)].map((_, j) => (
                            <div
                              key={j}
                              className="w-[2px] bg-radio-green rounded-full animate-eq-bar"
                              style={{ height: "8px", animationDelay: `${j * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-radio-green/60 uppercase tracking-wider font-medium">
                          Nu
                        </span>
                      </div>
                      <p className="text-[11px] text-white/70 truncate font-medium">{currentTrack.name}</p>
                      <p className="text-[10px] text-white/30 truncate">
                        {currentTrack.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Queue items */}
              <div className="max-h-[280px] overflow-y-auto scrollbar-none">
                {upcoming.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.03] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                      </svg>
                    </div>
                    <p className="text-white/20 text-[11px]">
                      Nummers worden automatisch geselecteerd
                    </p>
                  </div>
                ) : (
                  upcoming.map((track, i) => (
                    <motion.div
                      key={track.id + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Position number */}
                      <span className="text-[10px] text-white/15 font-mono w-4 text-center flex-shrink-0">
                        {i + 1}
                      </span>

                      {/* Album art */}
                      {track.album?.images?.[0]?.url ? (
                        <img
                          src={track.album.images[0].url}
                          alt=""
                          className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-white/[0.04] flex-shrink-0" />
                      )}

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/60 truncate font-medium">
                          {track.name}
                        </p>
                        <p className="text-[10px] text-white/25 truncate">
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      </div>

                      {/* Duration */}
                      {track.duration_ms && (
                        <span className="text-[9px] text-white/15 font-mono flex-shrink-0">
                          {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
                        </span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              {queue.length > 5 && (
                <div className="px-4 py-2 border-t border-white/[0.04]">
                  <p className="text-[10px] text-white/15 text-center">
                    +{queue.length - 5} meer in de wachtrij
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
