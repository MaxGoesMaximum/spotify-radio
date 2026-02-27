"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/config/theme-context";
import { THEMES, type ThemeId } from "@/config/themes";

export default function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const themeOptions: { id: ThemeId; icon: string; label: string }[] = [
    { id: "dark", icon: "\u25cf", label: "Apple Dark" },
    { id: "midnight", icon: "\u263e", label: "Midnight" },
    { id: "light", icon: "\u2600", label: "Light" },
    { id: "sunset", icon: "\uD83C\uDF05", label: "Sunset" },
    { id: "ocean", icon: "\uD83C\uDF0A", label: "Ocean" },
  ];

  // Click-outside-to-close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all text-xs group"
      >
        <span className="group-hover:scale-110 transition-transform">{THEMES[themeId].icon}</span>
        <span className="text-white/40 hidden sm:inline group-hover:text-white/60 transition-colors">
          {THEMES[themeId].label}
        </span>
        <svg
          className={`w-3 h-3 text-white/20 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute right-0 top-full mt-2 bg-radio-surface/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl overflow-hidden z-50 min-w-[140px] shadow-2xl shadow-black/40"
          >
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-all ${themeId === opt.id
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
              >
                <span className="text-sm">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
                {themeId === opt.id && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-[10px] text-radio-green"
                  >
                    \u2713
                  </motion.span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
