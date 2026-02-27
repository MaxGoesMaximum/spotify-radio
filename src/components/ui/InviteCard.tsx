"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Invite System — Generate shareable invite links
 */

export function InviteCard() {
    const [copied, setCopied] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    useEffect(() => {
        // Generate a unique invite code based on the current user
        const code = btoa(Date.now().toString(36) + Math.random().toString(36).slice(2)).slice(0, 8).toUpperCase();
        setInviteCode(code);
    }, []);

    const inviteUrl = typeof window !== "undefined"
        ? `${window.location.origin}/?ref=${inviteCode}`
        : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = inviteUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Spotify Radio",
                    text: "Luister mee naar Spotify Radio — de intelligente live-radio ervaring! 🎵",
                    url: inviteUrl,
                });
            } catch { }
        } else {
            handleCopy();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.06] p-6 bg-[#111113]"
        >
            <h3 className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wider">
                🎟️ Nodig Vrienden Uit
            </h3>
            <p className="text-white/30 text-xs mb-4">
                Deel je unieke link en laat vrienden ook luisteren.
            </p>

            {/* Invite URL Display */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 text-xs font-mono truncate">
                    {inviteUrl || "Laden..."}
                </div>
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${copied
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.1]"
                        }`}
                >
                    {copied ? "✓ Gekopieerd" : "Kopieer"}
                </motion.button>
            </div>

            {/* Share Button */}
            <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl bg-radio-accent/10 border border-radio-accent/20 text-radio-accent text-sm font-medium hover:bg-radio-accent/20 transition-colors"
            >
                📤 Deel met vrienden
            </motion.button>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
                <div className="text-center flex-1">
                    <p className="text-lg font-bold text-white">-</p>
                    <p className="text-white/20 text-[10px] uppercase">Uitgenodigden</p>
                </div>
                <div className="w-px h-8 bg-white/[0.04]" />
                <div className="text-center flex-1">
                    <p className="text-lg font-bold text-radio-accent">{inviteCode}</p>
                    <p className="text-white/20 text-[10px] uppercase">Jouw code</p>
                </div>
            </div>
        </motion.div>
    );
}
