"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRadioStore } from "@/store/radio-store";
import { motion, AnimatePresence } from "framer-motion";

function formatLastUpdated(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export function NewsWidget() {
  const news = useRadioStore((s) => s.news);
  const newsLastUpdated = useRadioStore((s) => s.newsLastUpdated);
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);
  const currentSegmentType = useRadioStore((s) => s.currentSegmentType);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isNewsSegment = currentSegmentType === "news" || currentSegmentType === "news_full";

  // Click outside to close overlay
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
      setShowOverlay(false);
    }
  }, []);

  useEffect(() => {
    if (showOverlay) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showOverlay, handleClickOutside]);

  // Empty state
  if (news.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.04] py-2.5">
        <div className="flex items-center gap-3 px-3">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white/20 bg-white/[0.03]">
            Nieuws
          </span>
          <span className="text-sm text-white/15">
            Nieuws wordt geladen...
          </span>
        </div>
      </div>
    );
  }

  const tickerText = news.map((a) => `${a.title} \u2014 ${a.source}`).join("   \u2022   ");

  return (
    <div className="relative" ref={overlayRef}>
      {/* Ticker bar */}
      <div className="w-full overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] py-2.5">
        <div className="flex items-center gap-3 px-3">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80 ${
              isNewsSegment
                ? "text-white bg-radio-glow/80"
                : "text-radio-accent bg-radio-accent/10"
            }`}
            aria-label="Nieuws openen"
            aria-expanded={showOverlay}
          >
            {isNewsSegment && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
            Nieuws
            <span className="text-[8px] opacity-50 ml-0.5">{news.length}</span>
          </button>
          <div className="overflow-hidden flex-1">
            <div
              className="animate-slide-left whitespace-nowrap text-sm text-white/40"
              style={{
                animationDuration: `${Math.max(20, news.length * 10)}s`,
              }}
            >
              {tickerText}   \u2022   {tickerText}
            </div>
          </div>
        </div>
      </div>

      {/* News overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-full mb-2 left-0 right-0 max-h-80 overflow-y-auto rounded-xl bg-radio-surface/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 p-4"
            role="dialog"
            aria-label="Nieuwsoverzicht"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Laatste Nieuws
                </h3>
                {newsLastUpdated != null && (
                  <p className="text-[10px] text-white/25 mt-0.5">
                    Laatst geüpdatet om {formatLastUpdated(newsLastUpdated)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowOverlay(false)}
                className="text-white/30 hover:text-white/60 transition-colors text-lg leading-none"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5">
              {news.slice(0, 5).map((article, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/[0.04] rounded-lg p-3 hover:bg-white/[0.06] transition-colors group"
                >
                  <h4 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  {article.description && (
                    <p className="text-[11px] text-white/35 mt-1 line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-white/25">
                      {article.source}
                    </span>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-radio-accent/60 hover:text-radio-accent transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Lees meer →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
