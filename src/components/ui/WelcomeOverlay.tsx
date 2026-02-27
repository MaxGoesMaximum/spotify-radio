"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "spotify-radio-onboarded";

const TIPS = [
    {
        icon: "M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z",
        title: "Draai aan de FM dial",
        description: "Gebruik de stationkiezer om tussen 10 verschillende genre-zenders te schakelen.",
    },
    {
        icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
        title: "Luister naar je DJ",
        description: "De AI-DJ presenteert weer, nieuws en leuke weetjes — net als echte radio!",
    },
    {
        icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
        title: "Sla favorieten op",
        description: "Druk op het hartje om nummers te bewaren in je Spotify-bibliotheek.",
    },
    {
        icon: "M11.42 15.17l-5.422-2.19a.75.75 0 010-1.395l10.938-4.813a.75.75 0 01.992.716l-.81 10.866a.75.75 0 01-1.354.458l-3.344-4.642z",
        title: "Sneltoetsen",
        description: "Druk op Spatie om te pauzeren, N om te skippen. Bekijk alle sneltoetsen met ?",
    },
];

export function WelcomeOverlay() {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Only show on first visit
        if (typeof window !== "undefined") {
            const onboarded = localStorage.getItem(STORAGE_KEY);
            if (!onboarded) {
                setShow(true);
            }
        }
    }, []);

    const handleComplete = () => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    const handleNext = () => {
        if (step < TIPS.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="max-w-sm w-full rounded-3xl bg-[#1c1c1e] border border-white/[0.08] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 pb-0 text-center">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-5"
                            >
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={TIPS[step].icon} />
                                </svg>
                            </motion.div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <h2 className="text-xl font-bold text-white mb-2">{TIPS[step].title}</h2>
                                    <p className="text-white/40 text-sm leading-relaxed">{TIPS[step].description}</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-2 py-6">
                            {TIPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === step
                                            ? "bg-white w-4"
                                            : i < step
                                                ? "bg-white/30"
                                                : "bg-white/10"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={handleComplete}
                                className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/40 text-sm font-medium hover:bg-white/[0.08] transition-colors"
                            >
                                Overslaan
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 px-4 py-3 rounded-2xl bg-white text-black text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(255,255,255,0.1)]"
                            >
                                {step < TIPS.length - 1 ? "Volgende" : "Begin!"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
