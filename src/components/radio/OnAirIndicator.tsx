"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

export function OnAirIndicator() {
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);
  const isPlaying = useRadioStore((s) => s.isPlaying);

  return (
    <div className="flex items-center gap-2.5">
      <AnimatePresence mode="wait">
        {isAnnouncerSpeaking ? (
          <motion.div
            key="on-air"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-radio-glow/10 border border-radio-glow/20"
          >
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-radio-glow" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-radio-glow/50 animate-ping" />
            </div>
            <span className="text-radio-glow text-[10px] font-bold uppercase tracking-[0.2em]">
              ON AIR
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  isPlaying ? "bg-radio-green" : "bg-white/15"
                }`}
              />
              {isPlaying && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-radio-green/40 animate-pulse" />
              )}
            </div>
            <span
              className={`text-[10px] uppercase tracking-[0.15em] font-medium transition-colors duration-500 ${
                isPlaying ? "text-radio-green/80" : "text-white/20"
              }`}
            >
              {isPlaying ? "Live" : "Offline"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
