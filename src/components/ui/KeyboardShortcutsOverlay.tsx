"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHORTCUTS = [
    { key: "Space", action: "Afspelen / Pauzeren" },
    { key: "N", action: "Volgend nummer" },
    { key: "↑", action: "Volume omhoog" },
    { key: "↓", action: "Volume omlaag" },
    { key: "M", action: "Dempen" },
    { key: "1-0", action: "Wissel van zender" },
    { key: "F", action: "Favoriet opslaan" },
    { key: "?", action: "Sneltoetsen tonen" },
];

export function KeyboardShortcutsOverlay() {
    const [show, setShow] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShow((prev) => !prev);
        }
        if (e.key === "Escape") setShow(false);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShow(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="max-w-sm w-full rounded-3xl bg-[#1a1a1c] border border-white/[0.08] p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">⌨ Sneltoetsen</h2>
                            <button
                                onClick={() => setShow(false)}
                                className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2">
                            {SHORTCUTS.map((shortcut) => (
                                <div
                                    key={shortcut.key}
                                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                                >
                                    <span className="text-white/50 text-sm">{shortcut.action}</span>
                                    <kbd className="px-2 py-1 rounded-lg bg-white/[0.08] border border-white/[0.1] text-white/80 text-xs font-mono font-bold min-w-[2rem] text-center">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <p className="text-white/20 text-[10px] text-center mt-4">
                            Druk op <kbd className="px-1 py-0.5 rounded bg-white/[0.08] text-white/40 font-mono">?</kbd> of <kbd className="px-1 py-0.5 rounded bg-white/[0.08] text-white/40 font-mono">Esc</kbd> om te sluiten
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
