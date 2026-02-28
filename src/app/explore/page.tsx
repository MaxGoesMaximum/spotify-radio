"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATIONS, StationConfig } from "@/config/stations";
import { useRadioStore } from "@/store/radio-store";
import { useSpotifySession } from "@/hooks/useSpotifySession";
import { DiscoveryFeed } from "@/components/explore/DiscoveryFeed";
import { CustomStationBuilder } from "@/components/radio/CustomStationBuilder";
import Link from "next/link";

/* ───── 3D Tilt Card ───── */
function TiltCard({ station, onClick }: { station: StationConfig; onClick: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glareX, setGlareX] = useState(50);
    const [glareY, setGlareY] = useState(50);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rY = ((x - centerX) / centerX) * 12;
        const rX = ((centerY - y) / centerY) * 12;

        setRotateX(rX);
        setRotateY(rY);
        setGlareX((x / rect.width) * 100);
        setGlareY((y / rect.height) * 100);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setIsHovered(false);
    };

    return (
        <Link href="/radio" onClick={onClick}>
            <div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/[0.06] aspect-[4/3] flex flex-col justify-between p-7 sm:p-8 group"
                style={{
                    transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
                    background: "#111113",
                }}
            >
                {/* Radial colour bleed */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 z-0"
                    style={{
                        background: `radial-gradient(circle at 70% 20%, ${station.color}44, transparent 60%)`,
                    }}
                />

                {/* Glare overlay */}
                {isHovered && (
                    <div
                        className="pointer-events-none absolute inset-0 z-30 opacity-[0.07]"
                        style={{
                            background: `radial-gradient(circle at ${glareX}% ${glareY}%, white 0%, transparent 60%)`,
                        }}
                    />
                )}

                {/* Top row */}
                <div className="relative z-10 flex justify-between items-start">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm border border-white/[0.06]"
                        style={{ backgroundColor: `${station.color}15`, color: station.color }}
                    >
                        {station.icon}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out border border-white/[0.06]">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Bottom content */}
                <div className="relative z-10">
                    <h2
                        className="text-xl sm:text-2xl font-bold mb-1 transition-colors duration-300"
                        style={{ color: isHovered ? "#fff" : station.color }}
                    >
                        {station.label}
                    </h2>
                    <p className="text-white/50 text-sm font-medium leading-relaxed">
                        {station.tagline}
                    </p>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {station.searchTerms.slice(0, 3).map((term) => (
                            <span
                                key={term}
                                className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full text-white/30 bg-white/[0.04] border border-white/[0.06]"
                            >
                                {term}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ───── Custom Station Card ───── */
function CustomStationCard({ station, onActivate, onDelete }: {
    station: { id: string; label: string; color: string; searchTerms: string[] };
    onActivate: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="relative rounded-2xl border border-white/[0.06] p-5 bg-[#111113] group">
            <button
                onClick={onDelete}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <Link href="/radio" onClick={onActivate}>
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/[0.06]"
                        style={{ backgroundColor: `${station.color}15`, color: station.color }}
                    >
                        {"\u2b50"}
                    </div>
                    <h3 className="text-base font-bold text-white">{station.label}</h3>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {station.searchTerms.slice(0, 4).map((term) => (
                        <span
                            key={term}
                            className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full text-white/25 bg-white/[0.03] border border-white/[0.05]"
                        >
                            {term}
                        </span>
                    ))}
                </div>
            </Link>
        </div>
    );
}

/* ───── Tab IDs ───── */
type TabId = "stations" | "discoveries" | "custom";

const TABS: { id: TabId; label: string }[] = [
    { id: "stations", label: "Zenders" },
    { id: "discoveries", label: "Ontdekkingen" },
    { id: "custom", label: "Eigen zenders" },
];

/* ───── Page ───── */
export default function ExplorePage() {
    const setGenre = useRadioStore((state) => state.setGenre);
    const setPlaying = useRadioStore((state) => state.setPlaying);
    const customStations = useRadioStore((s) => s.customStations);
    const removeCustomStation = useRadioStore((s) => s.removeCustomStation);
    const setActiveCustomStation = useRadioStore((s) => s.setActiveCustomStation);
    const { session } = useSpotifySession();
    const [activeTab, setActiveTab] = useState<TabId>("stations");
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    const handleStationClick = (station: StationConfig) => {
        setGenre(station.id);
        setPlaying(true);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.15 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 260, damping: 22 },
        },
    };

    return (
        <main className="min-h-screen bg-black text-white pt-20 pb-32 px-5 sm:px-10 md:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10"
                >
                    <p className="text-radio-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        Ontdekken
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        {activeTab === "stations" && <>Kies je <span className="text-white/40">zender</span></>}
                        {activeTab === "discoveries" && <>Jouw <span className="text-emerald-400/60">ontdekkingen</span></>}
                        {activeTab === "custom" && <>Eigen <span className="text-purple-400/60">zenders</span></>}
                    </h1>
                    <p className="text-lg text-white/40 font-light max-w-xl leading-relaxed">
                        {activeTab === "stations" && "Elke zender wordt gestuurd door een intelligente DJ die muziek, weer en nieuws naadloos combineert."}
                        {activeTab === "discoveries" && "Nummers die je via de radio hebt ontdekt en die nog niet in je Spotify bibliotheek staan."}
                        {activeTab === "custom" && "Maak je eigen zenders op basis van artiesten, genres of sfeer."}
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? "bg-white/10 text-white"
                                    : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    {activeTab === "stations" && (
                        <motion.div
                            key="stations"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {STATIONS.map((station) => (
                                    <motion.div key={station.id} variants={item}>
                                        <TiltCard
                                            station={station}
                                            onClick={() => handleStationClick(station)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === "discoveries" && (
                        <motion.div
                            key="discoveries"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {session?.accessToken ? (
                                <DiscoveryFeed accessToken={session.accessToken} />
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-white/30 text-sm">Log in om je ontdekkingen te zien</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "custom" && (
                        <motion.div
                            key="custom"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-6">
                                {customStations.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {customStations.map((station) => (
                                            <CustomStationCard
                                                key={station.id}
                                                station={station}
                                                onActivate={() => {
                                                    setActiveCustomStation(station.id);
                                                    setPlaying(true);
                                                }}
                                                onDelete={() => removeCustomStation(station.id)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {customStations.length < 5 && (
                                    <motion.button
                                        onClick={() => setIsBuilderOpen(true)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full py-8 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-purple-500/30 text-white/25 hover:text-purple-400 transition-all flex flex-col items-center gap-2"
                                    >
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        <span className="text-sm font-medium">Nieuwe zender aanmaken</span>
                                        <span className="text-xs text-white/15">{customStations.length}/5 zenders</span>
                                    </motion.button>
                                )}
                            </div>

                            <AnimatePresence>
                                {isBuilderOpen && (
                                    <CustomStationBuilder
                                        onClose={() => setIsBuilderOpen(false)}
                                        onStationCreated={() => {}}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
