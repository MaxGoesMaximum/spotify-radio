"use client";

import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { GENRES, type Genre } from "@/types";
import { cn } from "@/lib/utils";

interface GenreSelectorProps {
  onGenreChange: (genre: Genre) => void;
}

export function GenreSelector({ onGenreChange }: GenreSelectorProps) {
  const currentGenre = useRadioStore((s) => s.currentGenre);

  return (
    <div className="space-y-3">
      <div className="text-center text-[10px] uppercase tracking-[0.25em] text-white/25 font-medium">
        FM Stations
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {GENRES.map((genre) => {
          const isActive = currentGenre === genre.id;
          return (
            <motion.button
              key={genre.id}
              onClick={() => onGenreChange(genre.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                "border backdrop-blur-sm",
                isActive
                  ? "border-white/20 text-white shadow-lg"
                  : "border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15"
              )}
              style={{
                backgroundColor: isActive ? `${genre.color}15` : "transparent",
                boxShadow: isActive
                  ? `0 0 25px ${genre.color}25, inset 0 0 25px ${genre.color}08`
                  : "none",
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="genre-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: genre.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Live pulse */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: genre.color }}
                  animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{genre.icon}</span>
                  <span className="text-[10px] font-mono opacity-50">
                    {genre.frequency}
                  </span>
                </div>
                <span>{genre.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
