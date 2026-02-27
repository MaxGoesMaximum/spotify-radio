"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

export function SongHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const songHistory = useRadioStore((s) => s.songHistory);
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside-to-close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative" ref={ref}>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all group"
      >
        <svg className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors hidden sm:inline">
          Geschiedenis
        </span>
        {songHistory.length > 0 && (
          <span className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded-full text-white/30 font-mono tabular-nums">
            {songHistory.length}
          </span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-xl bg-radio-surface/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 z-50"
          >
            {/* Header */}
            <div className="sticky top-0 p-3 border-b border-white/[0.06] bg-radio-surface/90 backdrop-blur-xl rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Recent gespeeld</h3>
                <span className="text-[10px] text-white/20 font-mono">{songHistory.length} nummers</span>
              </div>
            </div>

            {songHistory.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.03] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                </div>
                <p className="text-white/25 text-xs">Nog geen nummers gespeeld</p>
              </div>
            ) : (
              <div className="p-1.5">
                {songHistory.slice(0, 25).map((entry, idx) => (
                  <motion.div
                    key={`${entry.track.id}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.2 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors group/item"
                  >
                    {/* Index / Thumbnail */}
                    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white/[0.03]">
                      {entry.track.album.images[0] ? (
                        <img
                          src={entry.track.album.images[entry.track.album.images.length - 1]?.url || entry.track.album.images[0]?.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">
                          \u266b
                        </div>
                      )}
                      {/* Play count indicator */}
                      {idx === 0 && (
                        <div className="absolute inset-0 bg-radio-accent/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-radio-accent animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-white/80 truncate group-hover/item:text-white transition-colors">
                        {entry.track.name}
                      </div>
                      <div className="text-[11px] text-white/30 truncate">
                        {entry.track.artists.map((a) => a.name).join(", ")}
                      </div>
                    </div>

                    {/* Time */}
                    <span className="text-[10px] text-white/20 flex-shrink-0 font-mono tabular-nums">
                      {formatTime(entry.playedAt)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
