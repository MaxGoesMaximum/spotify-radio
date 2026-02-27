"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { getStationColor } from "@/config/stations";

type VisualizerStyle = "bars" | "wave" | "circular";

const STYLE_OPTIONS: { id: VisualizerStyle; label: string; icon: string }[] = [
    { id: "bars", label: "Bars", icon: "▐▌" },
    { id: "wave", label: "Golf", icon: "〰" },
    { id: "circular", label: "Cirkel", icon: "◎" },
];

export function VisualizerStyleSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [style, setStyle] = useState<VisualizerStyle>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("sr_viz_style") as VisualizerStyle) || "bars";
        }
        return "bars";
    });

    const selectStyle = (s: VisualizerStyle) => {
        setStyle(s);
        localStorage.setItem("sr_viz_style", s);
        setIsOpen(false);
        // Dispatch custom event for Visualizer to pick up
        window.dispatchEvent(new CustomEvent("vizStyleChange", { detail: s }));
    };

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
                title="Visualizer stijl"
            >
                <span className="text-xs">
                    {STYLE_OPTIONS.find((s) => s.id === style)?.icon}
                </span>
                <span className="text-xs hidden sm:inline">Viz</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-radio-surface/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-3 pb-2 border-b border-white/[0.06]">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                                Visualizer Stijl
                            </span>
                        </div>
                        <div className="p-1.5">
                            {STYLE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => selectStyle(opt.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${style === opt.id
                                            ? "bg-radio-accent/10 text-radio-accent"
                                            : "text-white/60 hover:bg-white/[0.06] hover:text-white/80"
                                        }`}
                                >
                                    <span className="text-base w-6 text-center">{opt.icon}</span>
                                    <span>{opt.label}</span>
                                    {style === opt.id && (
                                        <span className="ml-auto text-radio-accent text-xs">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
