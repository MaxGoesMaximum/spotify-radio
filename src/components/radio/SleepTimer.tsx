"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { pausePlayback } from "@/services/spotify-api";

interface SleepTimerProps {
  accessToken: string;
}

const PRESETS = [15, 30, 45, 60, 90];

export function SleepTimer({ accessToken }: SleepTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const sleepTimerEnd = useRadioStore((s) => s.sleepTimerEnd);
  const setSleepTimer = useRadioStore((s) => s.setSleepTimer);
  const setPlaying = useRadioStore((s) => s.setPlaying);
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

  const setTimer = useCallback(
    (minutes: number) => {
      const endTime = Date.now() + minutes * 60 * 1000;
      setSleepTimer(endTime);
      setIsOpen(false);
    },
    [setSleepTimer]
  );

  const clearTimer = useCallback(() => {
    setSleepTimer(null);
    setRemaining(null);
  }, [setSleepTimer]);

  // Countdown tick
  useEffect(() => {
    if (!sleepTimerEnd) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, sleepTimerEnd - Date.now());
      setRemaining(left);

      if (left <= 0) {
        setSleepTimer(null);
        setRemaining(null);
        pausePlayback(accessToken).catch(() => {});
        setPlaying(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd, accessToken, setSleepTimer, setPlaying]);

  const formatRemaining = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = remaining !== null && sleepTimerEnd
    ? 1 - (remaining / (sleepTimerEnd - (sleepTimerEnd - (remaining || 1))))
    : 0;

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
          remaining !== null
            ? "bg-radio-accent/10 border-radio-accent/30 text-radio-accent"
            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        {remaining !== null ? (
          <span className="text-xs font-mono tabular-nums">{formatRemaining(remaining)}</span>
        ) : (
          <span className="text-xs">Slaap</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-radio-surface/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            <div className="p-3 pb-2 border-b border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Slaaptimer</span>
            </div>

            <div className="p-1.5">
              {PRESETS.map((min) => (
                <button
                  key={min}
                  onClick={() => setTimer(min)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white/80 rounded-lg transition-all group"
                >
                  <span>{min} minuten</span>
                  <span className="text-[10px] text-white/15 group-hover:text-white/30 font-mono">
                    {min < 60 ? `${min}m` : `${min / 60}u`}
                  </span>
                </button>
              ))}

              {remaining !== null && (
                <>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <button
                    onClick={clearTimer}
                    className="w-full text-left px-3 py-2 text-sm text-red-400/80 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    Timer uitschakelen
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
