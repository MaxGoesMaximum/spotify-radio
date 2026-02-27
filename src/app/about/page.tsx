"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
    {
        icon: "M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z",
        title: "AI Radio DJ",
        description: "Een menselijke DJ-stem die contextueel reageert op weer, nieuws, en het moment van de dag.",
        color: "#0A84FF",
    },
    {
        icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
        title: "Slimme Rotatie",
        description: "Powered door Spotify Recommendations API met dynamische energie-opbouw per sessie.",
        color: "#30D158",
    },
    {
        icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
        title: "Live Weer",
        description: "Realtime weersdata op basis van je locatie, naadloos verwerkt in DJ-scripts.",
        color: "#5AC8FA",
    },
    {
        icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z",
        title: "Nieuws Ticker",
        description: "Automatische nieuwsupdates uit je regio, door de DJ gepresenteerd.",
        color: "#FF9500",
    },
    {
        icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
        title: "Equalizer & Presets",
        description: "Pas je geluidsprofiel aan met vooringestelde EQ-profielen per genre.",
        color: "#FF2D55",
    },
    {
        icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
        title: "Favorieten & Geschiedenis",
        description: "Bewaar nummers die je leuk vindt en doorzoek je volledige luisterhistorie.",
        color: "#AF52DE",
    },
];

const TECH_STACK = [
    { title: "Next.js 14", desc: "App Router, Server Components & edge streaming.", color: "#fff" },
    { title: "Spotify Web API", desc: "Auth, playback control & smart recommendations.", color: "#1DB954" },
    { title: "Microsoft Edge TTS", desc: "Ultra-realistische, menselijke DJ AI stemmen.", color: "#0A84FF" },
    { title: "Framer Motion", desc: "Gelaagde, soepele 3D micro-animaties.", color: "#FF2D55" },
    { title: "Tailwind CSS", desc: "Utility-first design met Apple Dark esthetiek.", color: "#38BDF8" },
    { title: "Zustand + Prisma", desc: "Snelle global state + persistent SQLite database.", color: "#FF9500" },
];

export default function AboutPage() {
    const stagger = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
    };
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <main className="min-h-screen bg-black text-white pt-20 pb-32 px-5 sm:px-10 md:px-20">
            <div className="max-w-5xl mx-auto">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
                        className="mx-auto w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-[#1c1c1e] to-[#0c0c0e] border border-white/10 shadow-2xl flex items-center justify-center mb-8"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z" />
                        </svg>
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
                        Spotify <span className="text-white/40">Radio</span>
                    </h1>
                    <p className="text-lg text-white/40 font-light max-w-2xl mx-auto leading-relaxed">
                        Een next-generation luisterervaring die de kracht van Spotify combineert met een AI-aangedreven
                        DJ, live weer, lokaal nieuws, en een prachtige interface.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    {FEATURES.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={fadeUp}
                            className="relative overflow-hidden p-6 rounded-2xl bg-[#111113] border border-white/[0.06] group hover:border-white/[0.12] transition-colors"
                        >
                            <div
                                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                                style={{ background: feature.color }}
                            />
                            <svg
                                className="w-6 h-6 mb-4 relative z-10"
                                style={{ color: feature.color }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                            </svg>
                            <h3 className="text-white font-semibold text-base mb-2 relative z-10">{feature.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed relative z-10">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tech Stack */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-16"
                >
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Technologieën</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {TECH_STACK.map((tech) => (
                            <div key={tech.title} className="px-5 py-4 rounded-xl bg-[#111113] border border-white/[0.06]">
                                <h3 className="font-semibold text-sm mb-1" style={{ color: tech.color }}>{tech.title}</h3>
                                <p className="text-white/35 text-xs leading-relaxed">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Disclaimer & Legal Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl bg-[#111113] border border-white/[0.06] p-6"
                >
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Disclaimer</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-5">
                        Deze applicatie vereist een Spotify Premium-abonnement.
                        Het is een onofficiële open-source client; &quot;Spotify&quot; is een gedeponeerd handelsmerk van Spotify AB.
                        Gemaakt met ❤️ voor muziekliefhebbers die de charme van traditionele radio missen.
                    </p>
                    <div className="flex gap-3">
                        <Link href="/privacy" className="text-radio-accent text-xs font-medium hover:underline">
                            Privacybeleid
                        </Link>
                        <span className="text-white/10">·</span>
                        <Link href="/terms" className="text-radio-accent text-xs font-medium hover:underline">
                            Algemene Voorwaarden
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
