"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

const SEGMENT_LABELS: Record<string, string> = {
  intro: "Welkom",
  between: "DJ",
  weather: "Weer",
  weather_full: "Weerbericht",
  news: "Nieuws",
  news_full: "Nieuws",
  time: "Tijd",
  station_id: "Station",
  fun_fact: "Weetje",
  song_intro: "DJ",
  jingle: "Jingle",
  outro: "Tot ziens",
};

export function DJAvatar() {
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);
  const currentSegmentType = useRadioStore((s) => s.currentSegmentType);

  return (
    <AnimatePresence>
      {isAnnouncerSpeaking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col items-center gap-2"
        >
          {/* Microphone / Avatar circle */}
          <div className="relative">
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full bg-radio-accent/20 animate-ping" />
            <div
              className="absolute -inset-2 rounded-full bg-radio-accent/10 animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="absolute -inset-4 rounded-full bg-radio-accent/5 animate-pulse"
              style={{ animationDelay: "0.6s" }}
            />

            {/* Center icon */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-radio-accent to-radio-glow flex items-center justify-center shadow-lg shadow-radio-accent/40 z-10">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          </div>

          {/* Segment label */}
          {currentSegmentType && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1 rounded-full bg-radio-accent/20 border border-radio-accent/30"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-radio-accent">
                {SEGMENT_LABELS[currentSegmentType] || "DJ"}
              </span>
            </motion.div>
          )}

          {/* Sound wave bars */}
          <div className="flex items-center gap-0.5 h-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-radio-accent rounded-full"
                animate={{
                  height: ["4px", "16px", "8px", "14px", "4px"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
