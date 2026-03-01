"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { getMoodTarget } from "@/services/music-selector";

const SIZE = 140;
const CENTER = SIZE / 2;
const RADIUS = 52;
const AXES = [
  { label: "Energy", angle: -90 },
  { label: "Valence", angle: 30 },
  { label: "Dance", angle: 150 },
];

function polarToCartesian(angle: number, value: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * value * Math.cos(rad),
    y: CENTER + RADIUS * value * Math.sin(rad),
  };
}

function makePolygonPoints(values: number[]): string {
  return AXES.map((axis, i) => {
    const { x, y } = polarToCartesian(axis.angle, values[i]);
    return `${x},${y}`;
  }).join(" ");
}

export function MoodRadar() {
  const sessionMoodHistory = useRadioStore((s) => s.sessionMoodHistory);
  const moodTarget = useMemo(() => getMoodTarget(), []);

  // Calculate average of session mood
  const avgMood = useMemo(() => {
    if (sessionMoodHistory.length === 0) return null;
    const sum = sessionMoodHistory.reduce(
      (acc, p) => ({
        energy: acc.energy + p.energy,
        valence: acc.valence + p.valence,
        danceability: acc.danceability + p.danceability,
      }),
      { energy: 0, valence: 0, danceability: 0 }
    );
    const n = sessionMoodHistory.length;
    return {
      energy: sum.energy / n,
      valence: sum.valence / n,
      danceability: sum.danceability / n,
    };
  }, [sessionMoodHistory]);

  const targetValues = [moodTarget.energy, moodTarget.valence, moodTarget.danceability];
  const actualValues = avgMood
    ? [avgMood.energy, avgMood.valence, avgMood.danceability]
    : [0, 0, 0];

  // Grid levels
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-white/30 text-[10px] uppercase tracking-wider">
        Mood Radar
      </div>

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
      >
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={makePolygonPoints([level, level, level])}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((axis) => {
          const end = polarToCartesian(axis.angle, 1);
          return (
            <line
              key={axis.label}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Target polygon (dashed) */}
        <motion.polygon
          points={makePolygonPoints(targetValues)}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
          strokeDasharray="3 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Actual polygon (filled) */}
        <AnimatePresence>
          {avgMood && (
            <motion.polygon
              points={makePolygonPoints(actualValues)}
              fill="var(--color-radio-accent-raw, rgba(99,102,241,0.15))"
              stroke="var(--color-radio-accent, rgb(99,102,241))"
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
            />
          )}
        </AnimatePresence>

        {/* Axis labels */}
        {AXES.map((axis) => {
          const pos = polarToCartesian(axis.angle, 1.22);
          return (
            <text
              key={axis.label}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white/30 text-[8px]"
            >
              {axis.label}
            </text>
          );
        })}

        {/* Center dot */}
        <circle cx={CENTER} cy={CENTER} r={1.5} fill="rgba(255,255,255,0.15)" />
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-px border-b border-dashed border-white/25" />
          <span className="text-white/25">Doel</span>
        </div>
        {avgMood && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 rounded-sm bg-radio-accent/50" />
            <span className="text-white/30">Sessie</span>
          </div>
        )}
      </div>

      {/* Stats */}
      {avgMood && (
        <div className="flex gap-2 text-[9px] text-white/25">
          <span>E: {(avgMood.energy * 100).toFixed(0)}%</span>
          <span>V: {(avgMood.valence * 100).toFixed(0)}%</span>
          <span>D: {(avgMood.danceability * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
