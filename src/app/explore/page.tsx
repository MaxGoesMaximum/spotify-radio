"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
import { STATIONS, StationConfig } from "@/config/stations";
import { useRadioStore } from "@/store/radio-store";
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

/* ───── Page ───── */
export default function ExplorePage() {
    const setGenre = useRadioStore((state) => state.setGenre);
    const setPlaying = useRadioStore((state) => state.setPlaying);

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
                    className="mb-14"
                >
                    <p className="text-radio-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        Ontdekken
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Kies je <span className="text-white/40">zender</span>
                    </h1>
                    <p className="text-lg text-white/40 font-light max-w-xl leading-relaxed">
                        Elke zender wordt gestuurd door een intelligente DJ die muziek, weer en nieuws naadloos combineert.
                    </p>
                </motion.div>

                {/* Grid */}
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
            </div>
        </main>
    );
}
