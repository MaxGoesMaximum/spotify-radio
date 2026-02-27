"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CONSENT_KEY = "sr_cookie_consent";

export function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // Delay to avoid blocking initial render
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, "declined");
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-[999] p-4 sm:p-6"
                >
                    <div className="max-w-2xl mx-auto px-5 py-4 rounded-2xl bg-[#1a1a1c]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm font-medium">🍪 Cookies</p>
                            <p className="text-white/40 text-xs mt-1 leading-relaxed">
                                Wij gebruiken cookies voor je sessie en voorkeuren.
                                Lees ons{" "}
                                <Link href="/privacy" className="text-radio-accent hover:underline">
                                    privacybeleid
                                </Link>
                                .
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2 text-xs font-medium text-white/40 hover:text-white/70 transition-colors rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
                            >
                                Weigeren
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-4 py-2 text-xs font-semibold text-black bg-white rounded-lg hover:bg-white/90 transition-colors"
                            >
                                Accepteren
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
