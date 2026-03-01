"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEQManager, type EQConnectionStatus } from "@/services/audio-eq";

/* ─── Types ─── */
interface EQPreset {
  id: string;
  label: string;
  bands: number[]; // 10 bands, values -12 to +12 dB
}

/* ─── Apple-style presets (10-band) ─── */
const PRESETS: EQPreset[] = [
  { id: "flat",      label: "Flat",         bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass",      label: "Bass Boost",   bands: [8, 6, 4, 1, 0, 0, 0, 0, 0, 0] },
  { id: "treble",    label: "Treble Boost",  bands: [0, 0, 0, 0, 0, 1, 3, 5, 7, 8] },
  { id: "vocal",     label: "Vocal",        bands: [-2, -1, 0, 3, 6, 6, 3, 0, -1, -2] },
  { id: "night",     label: "Late Night",   bands: [-4, -2, 0, 2, 3, 3, 2, 0, -2, -5] },
  { id: "hiphop",    label: "Hip-Hop",      bands: [6, 5, 1, 0, -1, 0, 2, 0, 3, 4] },
  { id: "electronic",label: "Electronic",   bands: [5, 4, 0, -2, 0, 2, 0, 3, 5, 6] },
  { id: "acoustic",  label: "Acoustic",     bands: [3, 1, 0, 1, 2, 3, 3, 2, 2, 1] },
  { id: "loudness",  label: "Loudness",     bands: [6, 4, 0, -1, -2, -1, 0, -1, 5, 3] },
];

const FREQ_LABELS = ["32", "64", "125", "250", "500", "1K", "2K", "4K", "8K", "16K"];
const DB_RANGE = 12;

const STATUS_CONFIG: Record<EQConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: "Zoeken...", color: "text-white/20" },
  connecting: { label: "Verbinden...", color: "text-amber-400/60" },
  connected: { label: "Actief", color: "text-emerald-400/70" },
  failed: { label: "Alleen visueel", color: "text-white/20" },
};

export function EQPresets() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [activePreset, setActivePreset] = useState("flat");
  const [bands, setBands] = useState<number[]>(new Array(10).fill(0));
  const [dragging, setDragging] = useState<number | null>(null);
  const [eqStatus, setEqStatus] = useState<EQConnectionStatus>("disconnected");
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize AudioEQ and subscribe to status changes
  useEffect(() => {
    audioEQManager.startObserving();
    const unsubscribe = audioEQManager.onStatusChange(setEqStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  // Sync enabled state to AudioEQ
  useEffect(() => {
    audioEQManager.setEnabled(isEnabled);
  }, [isEnabled]);

  // Click-outside-to-close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const selectPreset = useCallback((preset: EQPreset) => {
    setActivePreset(preset.id);
    setBands([...preset.bands]);
    // Apply to real audio
    audioEQManager.setAllBands(preset.bands);
  }, []);

  const handleSliderInteraction = useCallback((index: number, clientY: number) => {
    const el = sliderRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const db = Math.round((ratio * 2 - 1) * DB_RANGE);
    setBands((prev) => {
      const next = [...prev];
      next[index] = db;
      // Apply single band to real audio
      audioEQManager.setBand(index, db);
      return next;
    });
    setActivePreset("custom");
  }, []);

  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(index);
    handleSliderInteraction(index, e.clientY);

    const onMove = (ev: MouseEvent) => handleSliderInteraction(index, ev.clientY);
    const onUp = () => {
      setDragging(null);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [handleSliderInteraction]);

  // Touch support for mobile
  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(index);
    handleSliderInteraction(index, e.touches[0].clientY);

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      handleSliderInteraction(index, ev.touches[0].clientY);
    };
    const onEnd = () => {
      setDragging(null);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  }, [handleSliderInteraction]);

  // SVG frequency response curve
  const curvePoints = bands.map((db, i) => {
    const x = (i / (bands.length - 1)) * 280 + 10;
    const y = 40 - (db / DB_RANGE) * 35;
    return `${x},${y}`;
  }).join(" ");

  const isActive = activePreset !== "flat" || bands.some((b) => b !== 0);
  const statusInfo = STATUS_CONFIG[eqStatus];

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
          isActive
            ? "bg-radio-accent/10 border-radio-accent/25 text-radio-accent"
            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        <span className="text-xs">EQ</span>
        {/* Connection status dot */}
        {eqStatus === "connected" && (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
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
              className="absolute right-0 top-full mt-2 w-[340px] rounded-2xl bg-[#1c1c1e]/98 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white">Equalizer</span>
                  {/* Connection status indicator */}
                  <span className={`text-[9px] ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/30">
                    {activePreset === "custom" ? "Aangepast" : PRESETS.find((p) => p.id === activePreset)?.label}
                  </span>
                  {/* On/Off toggle (Apple-style pill) */}
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative w-[38px] h-[22px] rounded-full transition-colors duration-200 ${
                      isEnabled ? "bg-[#34c759]" : "bg-[#39393d]"
                    }`}
                  >
                    <motion.div
                      className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-md"
                      animate={{ left: isEnabled ? "18px" : "2px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* ── Frequency Response Curve ── */}
              <div className={`px-4 pt-3 transition-opacity ${isEnabled ? "opacity-100" : "opacity-30"}`}>
                <svg viewBox="0 0 300 80" className="w-full h-16 overflow-visible">
                  {/* Grid lines */}
                  <line x1="10" y1="40" x2="290" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <line x1="10" y1="10" x2="290" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2 4" />
                  <line x1="10" y1="70" x2="290" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2 4" />
                  {/* dB labels */}
                  <text x="2" y="13" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="monospace">+12</text>
                  <text x="2" y="43" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="monospace">0</text>
                  <text x="2" y="73" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="monospace">-12</text>
                  {/* Curve fill */}
                  <polygon
                    points={`10,40 ${curvePoints} 290,40`}
                    fill="url(#eqGradient)"
                    opacity="0.25"
                  />
                  {/* Curve line */}
                  <polyline
                    points={curvePoints}
                    fill="none"
                    stroke="var(--theme-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots on curve */}
                  {bands.map((db, i) => {
                    const x = (i / (bands.length - 1)) * 280 + 10;
                    const y = 40 - (db / DB_RANGE) * 35;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={dragging === i ? 3.5 : 2}
                        fill="var(--theme-accent)"
                        opacity={dragging === i ? 1 : 0.6}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* ── Vertical Sliders ── */}
              <div className={`px-4 pb-2 transition-opacity ${isEnabled ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                <div className="flex justify-between gap-1">
                  {bands.map((db, i) => {
                    const ratio = (db + DB_RANGE) / (DB_RANGE * 2); // 0 to 1
                    const isDraggingThis = dragging === i;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        {/* dB value */}
                        <span className={`text-[8px] font-mono tabular-nums h-3 transition-colors ${
                          db !== 0 ? "text-white/50" : "text-white/15"
                        }`}>
                          {db > 0 ? "+" : ""}{db}
                        </span>

                        {/* Slider track */}
                        <div
                          ref={(el) => { sliderRefs.current[i] = el; }}
                          className="relative w-5 h-24 rounded-full bg-[#2c2c2e] cursor-pointer group touch-none"
                          onMouseDown={(e) => handleMouseDown(i, e)}
                          onTouchStart={(e) => handleTouchStart(i, e)}
                        >
                          {/* Fill from center */}
                          <div
                            className="absolute left-1 right-1 rounded-full transition-all duration-75"
                            style={{
                              bottom: db >= 0 ? "50%" : `${ratio * 100}%`,
                              top: db >= 0 ? `${(1 - ratio) * 100}%` : "50%",
                              background: db !== 0
                                ? "linear-gradient(to top, var(--theme-accent), var(--theme-glow))"
                                : "transparent",
                              opacity: Math.abs(db) / DB_RANGE * 0.8 + 0.2,
                            }}
                          />

                          {/* Center line */}
                          <div className="absolute left-1 right-1 top-1/2 h-px bg-white/[0.08]" />

                          {/* Thumb */}
                          <motion.div
                            className="absolute left-0 right-0 mx-auto w-5 h-2 rounded-full shadow-lg"
                            style={{
                              bottom: `calc(${ratio * 100}% - 4px)`,
                              background: isDraggingThis
                                ? "linear-gradient(to bottom, #fff, #ddd)"
                                : "linear-gradient(to bottom, #e8e8e8, #b0b0b0)",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                            }}
                            animate={{ scale: isDraggingThis ? 1.2 : 1 }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>

                        {/* Frequency label */}
                        <span className="text-[7px] font-mono text-white/20 leading-none">
                          {FREQ_LABELS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Presets (scrollable pills) ── */}
              <div className="px-4 py-3 border-t border-white/[0.06]">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => selectPreset(preset)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                        activePreset === preset.id
                          ? "bg-white/[0.12] text-white"
                          : "bg-white/[0.04] text-white/35 hover:bg-white/[0.08] hover:text-white/60"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Status info (when failed) ── */}
              {eqStatus === "failed" && (
                <div className="px-4 pb-3">
                  <p className="text-[10px] text-white/20 text-center">
                    Audio processing niet beschikbaar door beveiligingsrestricties. EQ werkt als visualisatie.
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
