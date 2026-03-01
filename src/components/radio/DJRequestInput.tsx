"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { QUICK_CHIPS } from "@/services/dj/request-parser";
import { cn } from "@/lib/utils";

interface DJRequestInputProps {
  onSubmit: (text: string) => void;
  onClear: () => void;
}

export function DJRequestInput({ onSubmit, onClear }: DJRequestInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequest = useRadioStore((s) => s.activeRequest);
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);

  const handleSubmit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setInputValue("");
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(inputValue);
    }
    if (e.key === "Escape") {
      setInputValue("");
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleChipClick = (query: string) => {
    handleSubmit(query);
  };

  return (
    <div className="w-full space-y-2">
      {/* Active request indicator */}
      <AnimatePresence>
        {activeRequest && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-radio-accent/10 border border-radio-accent/20"
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-radio-accent text-xs">🎵</span>
              <span className="text-radio-accent text-xs font-medium truncate">
                {activeRequest.label}
              </span>
              <span className="text-white/30 text-[10px]">
                ({activeRequest.expiresAfterTracks} nummers)
              </span>
            </div>
            <motion.button
              onClick={onClear}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white/40 hover:text-white/70 transition-colors p-0.5"
              title="Verzoek annuleren"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="flex items-center gap-2">
        {/* Toggle button */}
        <motion.button
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all whitespace-nowrap",
            isExpanded
              ? "bg-radio-accent/10 border-radio-accent/25 text-radio-accent"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
          )}
          disabled={isAnnouncerSpeaking}
          title="Doe een verzoek aan de DJ"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          <span className="hidden sm:inline">Verzoek</span>
        </motion.button>

        {/* Expandable input */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bijv. jaren 80, rustige muziek, meer rock..."
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-radio-accent/40 focus:bg-white/[0.08] transition-all"
                  disabled={isAnnouncerSpeaking}
                />
                {inputValue && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleSubmit(inputValue)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md bg-radio-accent/20 hover:bg-radio-accent/30 text-radio-accent transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick chips (visible when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex flex-wrap gap-1.5"
          >
            {QUICK_CHIPS.map((chip, idx) => (
              <motion.button
                key={chip.query}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleChipClick(chip.query)}
                disabled={isAnnouncerSpeaking}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 text-[11px] hover:bg-white/[0.1] hover:text-white/70 hover:border-white/[0.15] transition-all disabled:opacity-40"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
