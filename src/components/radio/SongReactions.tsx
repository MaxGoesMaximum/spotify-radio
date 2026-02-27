"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { getStationColor } from "@/config/stations";

const REACTIONS = [
    { emoji: "🔥", label: "Fire" },
    { emoji: "❤️", label: "Love" },
    { emoji: "😴", label: "Meh" },
    { emoji: "🎵", label: "Vibe" },
    { emoji: "💃", label: "Dance" },
    { emoji: "👏", label: "Clap" },
];

interface FloatingReaction {
    id: string;
    emoji: string;
    x: number;
}

export function SongReactions() {
    const [reactions, setReactions] = useState<FloatingReaction[]>([]);
    const currentTrack = useRadioStore((s) => s.currentTrack);
    const currentGenre = useRadioStore((s) => s.currentGenre);
    const genreColor = getStationColor(currentGenre);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleReaction = (emoji: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        const x = 20 + Math.random() * 60; // random x position 20-80%
        setReactions((prev) => [...prev, { id, emoji, x }]);
        // Remove after animation
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2000);
    };

    if (!currentTrack) return null;

    return (
        <div className="relative" ref={containerRef}>
            {/* Floating reactions */}
            <div className="absolute bottom-full left-0 right-0 h-32 pointer-events-none overflow-hidden">
                <AnimatePresence>
                    {reactions.map((r) => (
                        <motion.div
                            key={r.id}
                            initial={{ y: 20, opacity: 1, scale: 0.5 }}
                            animate={{ y: -100, opacity: 0, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute text-2xl"
                            style={{ left: `${r.x}%` }}
                        >
                            {r.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Reaction buttons */}
            <div className="flex items-center gap-1.5 justify-center">
                {REACTIONS.map((r) => (
                    <motion.button
                        key={r.emoji}
                        onClick={() => handleReaction(r.emoji)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.06] transition-colors text-base"
                        title={r.label}
                        style={{
                            // subtle glow on hover
                        }}
                    >
                        {r.emoji}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
