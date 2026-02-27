"use client";

import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

export function ListenerCount() {
  const listenerCount = useRadioStore((s) => s.listenerCount);
  const isPlaying = useRadioStore((s) => s.isPlaying);

  if (!isPlaying) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-1.5 text-white/25"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <span className="text-[10px] font-mono tabular-nums">
        {listenerCount.toLocaleString("nl-NL")}
      </span>
    </motion.div>
  );
}
