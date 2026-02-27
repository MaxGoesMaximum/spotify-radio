"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

/**
 * ConnectionBanner — shown when the Spotify player is reconnecting.
 * It gives users clear visual feedback when there's a connectivity issue.
 */
export function ConnectionBanner() {
    const isConnected = useRadioStore((s) => s.isConnected);
    const reconnectAttempts = useRadioStore((s) => s.reconnectAttempts);

    // Only show when actively disconnected
    const show = !isConnected && reconnectAttempts > 0;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-[150] flex items-center justify-center gap-3 px-4 py-2.5 bg-orange-500/10 backdrop-blur-2xl border-b border-orange-500/15"
                >
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-orange-300 text-xs font-medium">
                        Verbinding verbroken — opnieuw verbinden...
                    </span>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${i < reconnectAttempts
                                        ? "bg-orange-400"
                                        : "bg-orange-400/20"
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
