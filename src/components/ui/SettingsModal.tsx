"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/config/theme-context";
import { THEMES, type ThemeId } from "@/config/themes";
import { useRadioStore } from "@/store/radio-store";
import type { DJVoice } from "@/types";

export function SettingsModal({ onClose }: { onClose: () => void }) {
    const { themeId, setTheme } = useTheme();
    const djVoice = useRadioStore((s) => s.djVoice);
    const setDJVoice = useRadioStore((s) => s.setDJVoice);
    const crossfadeDuration = useRadioStore((s) => s.crossfadeDuration);
    const setCrossfadeDuration = useRadioStore((s) => s.setCrossfadeDuration);

    const modalRef = useRef<HTMLDivElement>(null);

    // Close on outside click or Esc key
    useEffect(() => {
        const handleMouseOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("mousedown", handleMouseOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleMouseOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    const djOptions: { value: DJVoice; label: string; description: string }[] = [
        { value: "nl-NL-FennaNeural", label: "Fenna", description: "Vriendelijk, helder en energiek (Standaard)" },
        { value: "nl-NL-ColetteNeural", label: "Colette", description: "Warm, professioneel en duidelijk" },
        { value: "nl-NL-MaartenNeural", label: "Maarten", description: "Zwaar, rustig en informatief" },
    ];

    const themeOptions = [
        { id: "dark", icon: "\u25cf", label: "Apple Dark" },
        { id: "midnight", icon: "\u263e", label: "Midnight" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto">
            <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative w-full max-w-md overflow-hidden bg-radio-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                    <h2 className="text-lg font-semibold text-white">Instellingen</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Theme Section */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Thema</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {themeOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTheme(opt.id as ThemeId)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${themeId === opt.id
                                        ? "bg-radio-accent/10 border-radio-accent/30 text-white"
                                        : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{opt.icon}</span>
                                    <span className="text-xs font-medium">{opt.label}</span>
                                    {themeId === opt.id && (
                                        <motion.div layoutId="theme-active" className="w-1.5 h-1.5 rounded-full bg-radio-accent mt-1" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* DJ Voice Section */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">DJ Stem</h3>
                        <div className="space-y-2">
                            {djOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setDJVoice(opt.value)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${djVoice === opt.value
                                        ? "bg-white/10 border-white/20"
                                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <div>
                                        <div className={`font-medium ${djVoice === opt.value ? "text-white" : "text-white/80"}`}>
                                            {opt.label}
                                        </div>
                                        <div className="text-[10px] text-white/40 mt-0.5">{opt.description}</div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${djVoice === opt.value ? "border-radio-accent" : "border-white/20"
                                        }`}>
                                        {djVoice === opt.value && <div className="w-2 h-2 rounded-full bg-radio-accent" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Playback Settings */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Afspelen</h3>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-white/80 font-medium">Crossfade ({crossfadeDuration}s)</label>
                                    <span className="text-xs text-white/40">Vloeiende overgang tussen nummers</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="12"
                                    step="1"
                                    value={crossfadeDuration}
                                    onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                                    className="w-full appearance-none h-1.5 bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-pointer"
                                />
                                <div className="flex justify-between mt-1.5 text-[10px] text-white/30">
                                    <span>Uit</span>
                                    <span>12s</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </motion.div>
        </div>
    );
}
