"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useRadioStore } from "@/store/radio-store";

/**
 * Utility to extract a rough dominant color based on an image URL (using canvas)
 * Note: in a real environment, you might face CORS issues unless the image allows cross-origin.
 * Fallback: simple hash coloring based on album/artist strings.
 */
function getHashColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1) * 16777215).toString(16);
    return "#" + "000000".substring(0, 6 - color.length) + color;
}

export function AmbientBackground() {
    const currentTrack = useRadioStore((state) => state.currentTrack);
    const isPlaying = useRadioStore((state) => state.isPlaying);

    // Calculate two colors based on the track name/id to generate a unique vibe
    const colors = useMemo(() => {
        if (!currentTrack) {
            return {
                light: "#1c1c1e",
                dark: "#000000"
            };
        }
        const color1 = getHashColor(currentTrack.id + "1");
        const color2 = getHashColor(currentTrack.id + "2");
        return { light: color1, dark: color2 };
    }, [currentTrack]);

    return (
        <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-black">
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }} // Keep the intensity low for "Apple Dark" look
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <motion.div
                            animate={{
                                background: `radial-gradient(circle at 30% 30%, ${colors.light} 0%, transparent 60%)`,
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                                x: ["-10%", "10%", "-10%"],
                                y: ["-10%", "10%", "-10%"],
                            }}
                            transition={{
                                background: { duration: 2, ease: "easeInOut" },
                                scale: { duration: 30, repeat: Infinity, ease: "linear" },
                                rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                                x: { duration: 30, repeat: Infinity, ease: "linear" },
                                y: { duration: 30, repeat: Infinity, ease: "linear" }
                            }}
                            className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] rounded-full blur-[140px] mix-blend-screen"
                        />
                        <motion.div
                            animate={{
                                background: `radial-gradient(circle at 70% 70%, ${colors.dark} 0%, transparent 60%)`,
                                scale: [1, 1.5, 1],
                                rotate: [0, -90, 0],
                                x: ["10%", "-10%", "10%"],
                                y: ["10%", "-10%", "10%"],
                            }}
                            transition={{
                                background: { duration: 2, ease: "easeInOut" },
                                scale: { duration: 40, repeat: Infinity, ease: "linear" },
                                rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                                x: { duration: 40, repeat: Infinity, ease: "linear" },
                                y: { duration: 40, repeat: Infinity, ease: "linear" }
                            }}
                            className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] rounded-full blur-[140px] mix-blend-screen"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Base vignette and noise overlay to make it look premium */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.8)_120%)]" />
        </div>
    );
}
