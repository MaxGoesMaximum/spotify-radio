"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRadioStore } from "@/store/radio-store";
import { AVAILABLE_DECADES } from "@/services/dj/phrase-banks/era-context";
import { cn } from "@/lib/utils";

interface TimeMachineProps {
  onActivate: (decade: number | null) => void;
}

const DECADE_LABELS: Record<number, { label: string; emoji: string }> = {
  1960: { label: "60s", emoji: "🌸" },
  1970: { label: "70s", emoji: "🕺" },
  1980: { label: "80s", emoji: "🎹" },
  1990: { label: "90s", emoji: "📼" },
  2000: { label: "00s", emoji: "📱" },
  2010: { label: "10s", emoji: "🎧" },
  2020: { label: "20s", emoji: "🤖" },
};

export function TimeMachine({ onActivate }: TimeMachineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeMachineDecade = useRadioStore((s) => s.timeMachineDecade);
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);

  const handleDecadeClick = (decade: number) => {
    if (timeMachineDecade === decade) {
      // Deactivate
      onActivate(null);
    } else {
      onActivate(decade);
    }
  };

  const handleDeactivate = () => {
    onActivate(null);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all",
          timeMachineDecade
            ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        )}
        disabled={isAnnouncerSpeaking}
        title="Tijdmachine"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">
          {timeMachineDecade
            ? DECADE_LABELS[timeMachineDecade]?.label || "Actief"
            : "Tijdmachine"
          }
        </span>
      </motion.button>

      {/* Decade selector dropdown */}
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

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 z-50 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl p-3 shadow-2xl min-w-[220px]"
            >
              <div className="text-white/50 text-[10px] uppercase tracking-wider mb-2 px-1">
                Kies een decennium
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {AVAILABLE_DECADES.map((decade) => {
                  const info = DECADE_LABELS[decade];
                  const isActive = timeMachineDecade === decade;

                  return (
                    <motion.button
                      key={decade}
                      onClick={() => {
                        handleDecadeClick(decade);
                        setIsOpen(false);
                      }}
                      disabled={isAnnouncerSpeaking}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg border text-xs transition-all",
                        isActive
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                          : "bg-white/[0.04] border-white/[0.06] text-white/50 hover:bg-white/[0.08] hover:text-white/70 hover:border-white/[0.12]"
                      )}
                    >
                      <span className="text-sm">{info.emoji}</span>
                      <span className="font-medium">{info.label}</span>
                    </motion.button>
                  );
                })}

                {/* Off button */}
                {timeMachineDecade && (
                  <motion.button
                    onClick={() => {
                      handleDeactivate();
                      setIsOpen(false);
                    }}
                    disabled={isAnnouncerSpeaking}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all text-xs"
                  >
                    <span className="text-sm">⏹</span>
                    <span className="font-medium">Uit</span>
                  </motion.button>
                )}
              </div>

              {timeMachineDecade && (
                <div className="mt-2 pt-2 border-t border-white/[0.06] text-white/30 text-[10px] text-center">
                  Actief: {DECADE_LABELS[timeMachineDecade]?.label} muziek
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
