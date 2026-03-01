"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import type { TrackScoreBreakdown } from "@/types";

const ROTATION_LABELS: Record<string, { label: string; color: string }> = {
  C: { label: "Current", color: "#34d399" },
  R: { label: "Recurrent", color: "#60a5fa" },
  G: { label: "Gold", color: "#fbbf24" },
};

function ScoreFactor({ label, value, color }: { label: string; value: number; color?: string }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const barWidth = Math.min(Math.abs(value) * 100, 100);

  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-white/50 min-w-0 truncate">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${barWidth}%`,
              backgroundColor: color || (isPositive ? "#34d399" : isNegative ? "#f87171" : "#6b7280"),
            }}
          />
        </div>
        <span className={`font-mono w-10 text-right ${isPositive ? "text-emerald-400/70" : isNegative ? "text-red-400/70" : "text-white/30"}`}>
          {isPositive ? "+" : ""}{value.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export function WhyThisSong() {
  const [isOpen, setIsOpen] = useState(false);
  const breakdown = useRadioStore((s) => s.currentTrackBreakdown);
  const currentTrack = useRadioStore((s) => s.currentTrack);

  if (!currentTrack) return null;

  const rotation = breakdown ? ROTATION_LABELS[breakdown.rotationSlot] : null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
        title="Waarom dit nummer?"
        aria-label="Waarom dit nummer?"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-full right-0 mb-2 w-64 p-4 rounded-xl bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl z-50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Waarom dit nummer?</h4>
                {rotation && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{
                      color: rotation.color,
                      borderColor: `${rotation.color}30`,
                      backgroundColor: `${rotation.color}10`,
                    }}
                  >
                    {rotation.label}
                  </span>
                )}
              </div>

              {breakdown ? (
                <div className="space-y-2">
                  <ScoreFactor label="Populariteit" value={breakdown.popularity} color="#a78bfa" />
                  <ScoreFactor label="Rotatie bonus" value={breakdown.rotationBonus} />
                  <ScoreFactor label="Smaak match" value={breakdown.tasteBonus} />
                  {breakdown.discoveryBonus !== 0 && (
                    <ScoreFactor label="Ontdekking" value={breakdown.discoveryBonus} color="#38bdf8" />
                  )}
                  {breakdown.artistFrequencyPenalty !== 0 && (
                    <ScoreFactor label="Variatie" value={breakdown.artistFrequencyPenalty} />
                  )}
                  {breakdown.popularityRangeBonus > 0 && (
                    <ScoreFactor label="Station match" value={breakdown.popularityRangeBonus} />
                  )}

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Totaal</span>
                    <span className="text-sm font-bold font-mono text-white/80">
                      {breakdown.totalScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/30">Score data nog niet beschikbaar.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
