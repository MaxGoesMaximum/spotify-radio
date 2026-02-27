"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { STATIONS } from "@/config/stations";
import type { StationId } from "@/config/stations";

interface KeyboardShortcutsProps {
  onPlayPause: () => void;
  onSkip: () => void;
  onStationChange: (station: StationId) => void;
}

const SHORTCUTS = [
  { key: "Space", label: "Spatie", action: "Afspelen / Pauzeren", category: "Bediening" },
  { key: "N", label: "N", action: "Volgend nummer", category: "Bediening" },
  { key: "M", label: "M", action: "Dempen / Dempen opheffen", category: "Bediening" },
  { key: "ArrowUp", label: "\u2191", action: "Volume omhoog", category: "Bediening" },
  { key: "ArrowDown", label: "\u2193", action: "Volume omlaag", category: "Bediening" },
  { key: "ArrowLeft", label: "\u2190", action: "Vorige zender", category: "Zenders" },
  { key: "ArrowRight", label: "\u2192", action: "Volgende zender", category: "Zenders" },
  { key: "1-0", label: "1 \u2013 0", action: "Snelkeuze zender", category: "Zenders" },
  { key: "?", label: "?", action: "Sneltoetsen tonen", category: "Overig" },
  { key: "Escape", label: "Esc", action: "Paneel sluiten", category: "Overig" },
];

// Sort stations by frequency for left/right nav
const sortedStations = [...STATIONS].sort(
  (a, b) => parseFloat(a.frequency) - parseFloat(b.frequency)
);

export function KeyboardShortcuts({
  onPlayPause,
  onSkip,
  onStationChange,
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const volume = useRadioStore((s) => s.volume);
  const setVolume = useRadioStore((s) => s.setVolume);
  const currentGenre = useRadioStore((s) => s.currentGenre);
  const [lastMutedVolume, setLastMutedVolume] = useState(0.7);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "n":
        case "N":
          e.preventDefault();
          onSkip();
          break;
        case "m":
        case "M":
          e.preventDefault();
          if (volume > 0) {
            setLastMutedVolume(volume);
            setVolume(0);
          } else {
            setVolume(lastMutedVolume);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "ArrowLeft": {
          e.preventDefault();
          const curIdx = sortedStations.findIndex((s) => s.id === currentGenre);
          if (curIdx > 0) {
            onStationChange(sortedStations[curIdx - 1].id);
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const curIdx2 = sortedStations.findIndex((s) => s.id === currentGenre);
          if (curIdx2 < sortedStations.length - 1) {
            onStationChange(sortedStations[curIdx2 + 1].id);
          }
          break;
        }
        case "?":
          e.preventDefault();
          setIsOpen((prev) => !prev);
          break;
        case "Escape":
          setIsOpen(false);
          break;
        default:
          // Number keys 1-9,0 for station quick-select
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const idx = e.key === "0" ? 9 : parseInt(e.key) - 1;
            if (idx < sortedStations.length) {
              onStationChange(sortedStations[idx].id);
            }
          }
      }
    },
    [onPlayPause, onSkip, onStationChange, volume, setVolume, currentGenre, lastMutedVolume]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Group shortcuts by category
  const categories = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof SHORTCUTS>);

  return (
    <>
      {/* Small hint badge */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
        title="Sneltoetsen (?)"
      >
        <svg
          className="w-3.5 h-3.5 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <kbd className="text-[9px] text-white/20 font-mono bg-white/[0.04] px-1 rounded">?</kbd>
      </motion.button>

      {/* Help overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[420px] max-h-[80vh] overflow-y-auto z-[101] rounded-2xl bg-radio-surface/95 backdrop-blur-2xl border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-4 pb-3 border-b border-white/[0.06] bg-radio-surface/90 backdrop-blur-xl rounded-t-2xl">
                <div>
                  <h2 className="text-sm font-bold text-white">Sneltoetsen</h2>
                  <p className="text-[10px] text-white/30 mt-0.5">Toetsenbord bediening</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="p-4 space-y-4">
                {Object.entries(categories).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {shortcuts.map((s) => (
                        <div
                          key={s.key}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                        >
                          <span className="text-xs text-white/60">{s.action}</span>
                          <kbd className="text-[11px] font-mono text-white/40 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-md min-w-[28px] text-center shadow-[0_1px_0_rgba(255,255,255,0.06)]">
                            {s.label}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Station quick-reference */}
              <div className="p-4 pt-0">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 mb-2">
                  Zender snelkeuze
                </h3>
                <div className="grid grid-cols-5 gap-1">
                  {sortedStations.slice(0, 10).map((station, idx) => (
                    <div
                      key={station.id}
                      className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <kbd className="text-[10px] font-mono text-white/40">
                        {idx === 9 ? "0" : idx + 1}
                      </kbd>
                      <span className="text-[8px] text-white/30 truncate w-full text-center">
                        {station.icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
