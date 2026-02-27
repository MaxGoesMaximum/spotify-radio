"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSpotifySession } from "@/hooks/useSpotifySession";

interface StatsData {
    totalTracks: number;
    totalFavorites: number;
    totalMinutes: number;
    totalHours: number;
    topGenres: { genre: string; count: number }[];
    topArtists: { artist: string; count: number }[];
    listeningStreak: number;
    activeDaysLast30: number;
    memberSince: string | null;
}

const GENRE_COLORS: Record<string, string> = {
    pop: "#FF2D55",
    hiphop: "#FF9500",
    electronic: "#5856D6",
    rock: "#FF3B30",
    jazz: "#30D158",
    classical: "#AF52DE",
    rnb: "#FF6482",
    latin: "#FFD60A",
    default: "#0A84FF",
};

function getGenreColor(genre: string): string {
    return GENRE_COLORS[genre.toLowerCase()] || GENRE_COLORS.default;
}

export default function StatsPage() {
    const { session, status } = useSpotifySession();
    const router = useRouter();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/");
    }, [status, router]);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/user/stats");
            const data = await res.json();
            if (data.stats) setStats(data.stats);
        } catch (err) {
            console.error("Failed to load stats:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") fetchStats();
    }, [status, fetchStats]);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-[3px] border-white/10 border-t-radio-accent rounded-full animate-spin" />
            </div>
        );
    }

    const stagger = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
    };
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <main className="min-h-screen bg-black text-white pt-20 pb-32 px-5 sm:px-10 md:px-20">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12"
                >
                    <p className="text-radio-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        Analytics
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                        Jouw <span className="text-white/40">luisterstatistieken</span>
                    </h1>
                    <p className="text-white/40 text-base font-light max-w-xl">
                        Een diepgaand overzicht van je luistergewoonten, favoriete genres en artiesten.
                    </p>
                </motion.div>

                {isLoading ? (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <motion.div key={i} variants={fadeUp} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
                        ))}
                    </motion.div>
                ) : stats ? (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
                        {/* Big Stat Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Nummers", value: stats.totalTracks, color: "#0A84FF" },
                                { label: "Uur geluisterd", value: stats.totalHours, color: "#30D158" },
                                { label: "Favorieten", value: stats.totalFavorites, color: "#FF2D55" },
                                { label: "Dag streak", value: stats.listeningStreak, color: "#FF9500" },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    variants={fadeUp}
                                    className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 bg-[#111113]"
                                >
                                    <div
                                        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10"
                                        style={{ background: stat.color }}
                                    />
                                    <p className="text-3xl sm:text-4xl font-bold text-white font-heading relative z-10">
                                        {stat.value.toLocaleString("nl-NL")}
                                    </p>
                                    <p className="text-white/30 text-xs mt-1 uppercase tracking-wider font-medium relative z-10">
                                        {stat.label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Top Genres */}
                        {stats.topGenres.length > 0 && (
                            <motion.div
                                variants={fadeUp}
                                className="rounded-2xl border border-white/[0.06] p-6 bg-[#111113]"
                            >
                                <h3 className="text-white/80 text-sm font-semibold mb-5 uppercase tracking-wider">
                                    Top Genres
                                </h3>
                                <div className="space-y-4">
                                    {stats.topGenres.map((g, i) => {
                                        const barWidth = (g.count / stats.topGenres[0].count) * 100;
                                        const color = getGenreColor(g.genre);
                                        return (
                                            <div key={g.genre} className="flex items-center gap-4">
                                                <span className="text-white/20 text-xs w-5 text-right font-mono tabular-nums">{i + 1}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1.5">
                                                        <span className="text-white/80 text-sm font-medium capitalize">{g.genre}</span>
                                                        <span className="text-white/25 text-xs tabular-nums">{g.count} tracks</span>
                                                    </div>
                                                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${barWidth}%` }}
                                                            transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                            className="h-full rounded-full"
                                                            style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Top Artists */}
                        {stats.topArtists.length > 0 && (
                            <motion.div
                                variants={fadeUp}
                                className="rounded-2xl border border-white/[0.06] p-6 bg-[#111113]"
                            >
                                <h3 className="text-white/80 text-sm font-semibold mb-5 uppercase tracking-wider">
                                    Top Artiesten
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {stats.topArtists.map((a, i) => (
                                        <motion.div
                                            key={a.artist}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.05 }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <span className="text-white/15 text-xs w-5 text-right font-mono tabular-nums">{i + 1}</span>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] flex items-center justify-center border border-white/[0.06]">
                                                <span className="text-white/50 text-[10px] font-bold">{a.artist[0]}</span>
                                            </div>
                                            <span className="text-white/70 text-sm truncate flex-1 group-hover:text-white transition-colors">{a.artist}</span>
                                            <span className="text-white/20 text-xs tabular-nums">{a.count}×</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Activity Card */}
                        <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.06] p-6 bg-[#111113]">
                            <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">Activiteit</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-2xl font-bold text-radio-accent">{stats.activeDaysLast30}</p>
                                    <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">Actieve dagen (30d)</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-2xl font-bold text-white">{stats.totalMinutes.toLocaleString("nl-NL")}</p>
                                    <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">Totale minuten</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-white/30 text-sm">Geen statistieken beschikbaar. Begin met luisteren!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
