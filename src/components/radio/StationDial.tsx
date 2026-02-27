"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { STATIONS, getStation, getCurrentShow } from "@/config/stations";
import type { StationId } from "@/config/stations";

interface StationDialProps {
  onStationChange: (station: StationId) => void;
}

// FM band range
const FM_MIN = 86.0;
const FM_MAX = 109.0;
const FM_RANGE = FM_MAX - FM_MIN;

// Convert frequency to position percentage
function freqToPercent(freq: number): number {
  return ((freq - FM_MIN) / FM_RANGE) * 100;
}

export default function StationDial({ onStationChange }: StationDialProps) {
  const currentGenre = useRadioStore((s) => s.currentGenre);
  const currentStation = getStation(currentGenre);
  const currentShow = getCurrentShow(currentStation);

  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [dialOffset, setDialOffset] = useState(0);
  const [hoveredStation, setHoveredStation] = useState<StationId | null>(null);

  // Sort stations by frequency for display
  const sortedStations = [...STATIONS].sort(
    (a, b) => parseFloat(a.frequency) - parseFloat(b.frequency)
  );

  // Center dial on current station
  useEffect(() => {
    const freq = parseFloat(currentStation.frequency);
    const percent = freqToPercent(freq);
    // Center the needle (50%) on this station
    setDialOffset(50 - percent);
  }, [currentStation.frequency]);

  // Handle station click
  const handleStationClick = useCallback(
    (stationId: StationId) => {
      if (stationId !== currentGenre) {
        onStationChange(stationId);
      }
    },
    [currentGenre, onStationChange]
  );

  // Handle scroll wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const currentIdx = sortedStations.findIndex(
        (s) => s.id === currentGenre
      );
      if (e.deltaY > 0 || e.deltaX > 0) {
        // Scroll right → next station
        const nextIdx = Math.min(currentIdx + 1, sortedStations.length - 1);
        if (sortedStations[nextIdx].id !== currentGenre) {
          onStationChange(sortedStations[nextIdx].id);
        }
      } else {
        // Scroll left → previous station
        const prevIdx = Math.max(currentIdx - 1, 0);
        if (sortedStations[prevIdx].id !== currentGenre) {
          onStationChange(sortedStations[prevIdx].id);
        }
      }
    },
    [currentGenre, sortedStations, onStationChange]
  );

  // Generate frequency markers
  const freqMarkers: number[] = [];
  for (let f = Math.ceil(FM_MIN); f <= Math.floor(FM_MAX); f++) {
    freqMarkers.push(f);
    freqMarkers.push(f + 0.5);
  }

  return (
    <div className="w-full space-y-3">
      {/* Dial Container */}
      <div className="relative overflow-hidden rounded-xl bg-black/30 border border-white/[0.06] backdrop-blur-lg">
        {/* Red needle indicator (center) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-red-500 z-20 -translate-x-1/2">
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500/50 rounded-full" />
        </div>

        {/* Dial strip */}
        <div
          ref={dialRef}
          className="relative h-20 cursor-grab active:cursor-grabbing select-none"
          onWheel={handleWheel}
        >
          {/* Frequency markers strip */}
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(${dialOffset}%)`,
              width: "100%",
            }}
          >
            {/* Frequency tick marks */}
            {freqMarkers.map((freq) => {
              const pos = freqToPercent(freq);
              const isMajor = freq === Math.floor(freq);
              return (
                <div
                  key={freq}
                  className="absolute top-0 bottom-0 flex flex-col items-center"
                  style={{ left: `${pos}%` }}
                >
                  <div
                    className={`w-px ${
                      isMajor
                        ? "h-3 bg-white/30"
                        : "h-1.5 bg-white/15"
                    } mt-1`}
                  />
                  {isMajor && (
                    <span className="text-[9px] font-mono text-white/25 mt-0.5 tabular-nums">
                      {freq}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Station markers */}
            {sortedStations.map((station) => {
              const freq = parseFloat(station.frequency);
              const pos = freqToPercent(freq);
              const isActive = station.id === currentGenre;
              const isHovered = station.id === hoveredStation;

              return (
                <button
                  key={station.id}
                  onClick={() => handleStationClick(station.id)}
                  onMouseEnter={() => setHoveredStation(station.id)}
                  onMouseLeave={() => setHoveredStation(null)}
                  className="absolute flex flex-col items-center group"
                  style={{
                    left: `${pos}%`,
                    top: "22px",
                    transform: "translateX(-50%)",
                  }}
                >
                  {/* Station dot */}
                  <motion.div
                    className="relative"
                    animate={{
                      scale: isActive ? 1 : isHovered ? 0.9 : 0.7,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 transition-all duration-300"
                      style={{
                        backgroundColor: isActive
                          ? station.color
                          : "transparent",
                        borderColor: station.color,
                        boxShadow: isActive
                          ? `0 0 12px ${station.color}60, 0 0 24px ${station.color}30`
                          : "none",
                      }}
                    >
                      {station.icon}
                    </div>

                    {/* Active pulse ring */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ borderColor: station.color, borderWidth: 1 }}
                        animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Station label */}
                  <div className="mt-1 text-center whitespace-nowrap">
                    <span
                      className={`text-[9px] font-mono tabular-nums block transition-colors duration-300 ${
                        isActive
                          ? "text-white/80"
                          : "text-white/30 group-hover:text-white/50"
                      }`}
                    >
                      {station.frequency}
                    </span>
                    <span
                      className={`text-[10px] font-semibold block transition-all duration-300 ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-60"
                      }`}
                      style={{ color: isActive ? station.color : "white" }}
                    >
                      {station.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gradient fades on edges */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/50 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/50 to-transparent pointer-events-none z-10" />
      </div>

      {/* Station branding */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStation.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentStation.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-bold"
                  style={{ color: currentStation.color }}
                >
                  {currentStation.label}
                </span>
                <span className="text-[10px] font-mono text-white/30">
                  {currentStation.frequency} MHz
                </span>
              </div>
              <p className="text-[11px] text-white/40">
                {currentStation.tagline}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className="text-[10px] font-semibold tracking-wide uppercase"
              style={{ color: currentStation.color + "99" }}
            >
              {currentShow.name}
            </p>
            <p className="text-[9px] text-white/30">{currentShow.tagline}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
