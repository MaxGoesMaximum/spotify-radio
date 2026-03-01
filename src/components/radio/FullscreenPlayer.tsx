"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { getStationColor, getStation } from "@/config/stations";
import { SongProgressBar } from "./SongProgressBar";

export function FullscreenPlayer() {
    const [isOpen, setIsOpen] = useState(false);
    const currentTrack = useRadioStore((s) => s.currentTrack);
    const isPlaying = useRadioStore((s) => s.isPlaying);
    const currentGenre = useRadioStore((s) => s.currentGenre);

    const genreColor = getStationColor(currentGenre);
    const station = getStation(currentGenre);
    const albumImage = currentTrack?.album?.images?.[0]?.url;

    // Toggle with keyboard
    if (typeof window !== "undefined") {
        window.addEventListener("keydown", (e) => {
            if (e.key === "f" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement)) {
                setIsOpen((prev) => !prev);
            }
        });
    }

    return (
        <>
            {/* Toggle button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-all border border-white/[0.06] hover:border-white/[0.1] group"
                aria-label="Volledig scherm"
                title="Volledig scherm (F)"
            >
                <svg className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
            </motion.button>

            {/* Fullscreen overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[997] flex flex-col items-center justify-center"
                        style={{
                            background: `radial-gradient(ellipse at center, ${genreColor}15 0%, #000 70%)`,
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        {/* Close hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute top-6 right-6 text-white/20 text-xs"
                        >
                            Klik of druk F om te sluiten
                        </motion.p>

                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex flex-col items-center gap-8 max-w-lg w-full px-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Album Art with Ken Burns effect */}
                            <motion.div
                                className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl"
                                animate={{
                                    scale: isPlaying ? [1, 1.02, 1] : 1,
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                {albumImage ? (
                                    <img
                                        src={albumImage}
                                        alt={currentTrack?.album?.name || "Album"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-6xl"
                                        style={{ background: `linear-gradient(135deg, ${genreColor}30, ${genreColor}08)` }}
                                    >
                                        {station?.icon || "🎵"}
                                    </div>
                                )}
                                {/* Glow ring */}
                                <div
                                    className="absolute inset-0 rounded-3xl"
                                    style={{
                                        boxShadow: `0 0 80px ${genreColor}20, inset 0 0 0 1px ${genreColor}15`,
                                    }}
                                />
                            </motion.div>

                            {/* Track info */}
                            <div className="text-center space-y-2">
                                <motion.h2
                                    className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                                    key={currentTrack?.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {currentTrack?.name || "Geen nummer"}
                                </motion.h2>
                                <p className="text-white/40 text-base">
                                    {currentTrack?.artists?.map((a) => a.name).join(", ") || ""}
                                </p>
                                <p className="text-white/20 text-xs">
                                    {station?.label} · {station?.frequency}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full">
                                <SongProgressBar />
                            </div>

                            {/* Playing indicator */}
                            {isPlaying && (
                                <div className="flex items-center gap-1">
                                    {[0, 1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 rounded-full"
                                            style={{ background: genreColor }}
                                            animate={{ height: [4, 16, 4] }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                delay: i * 0.15,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
