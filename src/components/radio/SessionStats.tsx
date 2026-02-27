"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

export function SessionStats() {
  const sessionTrackCount = useRadioStore((s) => s.sessionTrackCount);
  const skipCount = useRadioStore((s) => s.skipCount);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Track session duration
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSessionMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatDuration = (mins: number): string => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}u ${m}m`;
  };

  // Don't show until some activity
  if (sessionTrackCount === 0 && sessionMinutes === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="flex items-center justify-center gap-4 py-3 mt-2"
    >
      <StatPill
        icon={
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        value={formatDuration(sessionMinutes)}
        label="luistertijd"
      />

      <div className="w-px h-3 bg-white/[0.06]" />

      <StatPill
        icon={
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
        }
        value={String(sessionTrackCount)}
        label="nummers"
      />

      <div className="w-px h-3 bg-white/[0.06]" />

      <StatPill
        icon={
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.689zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.689z" />
          </svg>
        }
        value={String(skipCount)}
        label="skips"
      />
    </motion.div>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-white/20">
      {icon}
      <span className="text-[11px] font-mono tabular-nums text-white/35">{value}</span>
      <span className="text-[10px] text-white/15">{label}</span>
    </div>
  );
}
