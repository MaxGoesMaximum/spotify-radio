"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSpotifySession } from "@/hooks/useSpotifySession";
import { STATIONS } from "@/config/stations";
import { InviteCard } from "@/components/ui/InviteCard";

interface ActivityEntry {
    id: string;
    user: { name: string; image: string | null; initials: string };
    trackName: string;
    artistName: string;
    station: string;
    minutesAgo: number;
}

function getStationMeta(stationName: string) {
    const s = STATIONS.find(
        (st) => st.label.toLowerCase() === stationName.toLowerCase() || st.id === stationName.toLowerCase()
    );
    return { color: s?.color || "#0A84FF", name: s?.label || stationName, icon: s?.icon || "🎵" };
}

export default function SocialPage() {
    const { session, status } = useSpotifySession();
    const router = useRouter();
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/");
    }, [status, router]);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await fetch("/api/user/activity");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setActivities(data.activity || []);
            setOnlineCount(data.onlineCount || 0);
            setError(null);
        } catch {
            setError("Kon activiteit niet laden");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchActivity();
            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchActivity, 30000);
            return () => clearInterval(interval);
        }
    }, [status, fetchActivity]);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-[3px] border-white/10 border-t-radio-accent rounded-full animate-spin" />
            </div>
        );
    }

    const stagger = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
    };
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <main className="min-h-screen bg-black text-white pt-20 pb-32 px-5 sm:px-10 md:px-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12"
                >
                    <p className="text-radio-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        Community
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                        Live <span className="text-white/40">activiteit</span>
                    </h1>
                    <p className="text-white/40 text-base font-light max-w-xl">
                        Ontdek wat anderen op dit moment luisteren op Spotify Radio.
                    </p>
                </motion.div>

                {/* Online indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 mb-8 px-4 py-3 rounded-2xl bg-[#111113] border border-white/[0.06]"
                >
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
                    </div>
                    <span className="text-white/60 text-sm">
                        <b className="text-white font-semibold">{onlineCount}</b> luisteraar{onlineCount !== 1 ? "s" : ""} nu online
                    </span>
                    <button
                        onClick={fetchActivity}
                        className="ml-auto text-white/20 hover:text-white/50 transition-colors"
                        title="Ververs"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                    </button>
                </motion.div>

                {/* Error */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-[72px] rounded-2xl bg-[#111113] border border-white/[0.04] animate-pulse" />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                        <p className="text-white/30 text-sm mb-2">Nog geen activiteit</p>
                        <p className="text-white/15 text-xs">Begin met luisteren om hier te verschijnen!</p>
                    </motion.div>
                ) : (
                    /* Feed */
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
                        {activities.map((activity) => {
                            const stationMeta = getStationMeta(activity.station);
                            return (
                                <motion.div
                                    key={activity.id}
                                    variants={fadeUp}
                                    className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#111113] border border-white/[0.06] hover:border-white/[0.12] transition-colors group"
                                >
                                    {/* Avatar */}
                                    {activity.user.image ? (
                                        <img
                                            src={activity.user.image}
                                            alt={activity.user.name}
                                            className="w-10 h-10 rounded-full border border-white/[0.08] object-cover shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm border border-white/[0.08]"
                                            style={{
                                                background: `linear-gradient(135deg, ${stationMeta.color}30, ${stationMeta.color}10)`,
                                                color: stationMeta.color,
                                            }}
                                        >
                                            {activity.user.initials}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white/90 text-sm font-medium truncate">
                                            {activity.user.name}{" "}
                                            <span className="text-white/30 font-normal">luistert naar</span>
                                        </p>
                                        <p className="text-white/50 text-xs truncate mt-0.5">
                                            {activity.trackName} · {activity.artistName}
                                        </p>
                                    </div>

                                    {/* Station pill */}
                                    <div
                                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border"
                                        style={{
                                            color: stationMeta.color,
                                            borderColor: `${stationMeta.color}25`,
                                            backgroundColor: `${stationMeta.color}08`,
                                        }}
                                    >
                                        <span>{stationMeta.icon}</span>
                                        {stationMeta.name}
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-white/20 text-[11px] shrink-0 tabular-nums">
                                        {activity.minutesAgo}m
                                    </span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Invite Friends Card */}
            <div className="mt-8">
                <InviteCard />
            </div>
        </main>
    );
}
