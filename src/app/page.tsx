"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotifySession } from "@/hooks/useSpotifySession";
import Link from "next/link";

const FEATURES = [
  {
    icon: "M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z",
    title: "10 FM Zenders",
    description: "Pop, Hip-Hop, Rock, Jazz, Classical en meer — allemaal met slimme rotatie.",
    color: "#FF2D55",
  },
  {
    icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
    title: "AI DJ Presentator",
    description: "Een realistische DJ die weer, nieuws en weetjes presenteert — net als echte radio.",
    color: "#5856D6",
  },
  {
    icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
    title: "Weer & Nieuws",
    description: "Live weerbericht en nieuwsupdates als onderdeel van je luisterervaring.",
    color: "#30D158",
  },
  {
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    title: "Sla Favorieten Op",
    description: "Bewaar nummers direct in je Spotify-bibliotheek met één tik.",
    color: "#FF3B30",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "Statistieken",
    description: "Bekijk je luistergedrag met gedetailleerde statistieken en grafieken.",
    color: "#FF9500",
  },
  {
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    title: "Community",
    description: "Ontdek wat anderen luisteren in de live communautaire feed.",
    color: "#0A84FF",
  },
];

function HomeContent() {
  const { session, status } = useSpotifySession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (session) {
      router.push("/radio");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 rounded-full border-[3px] border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Animated ambient gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-[-30%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-white/[0.03] to-transparent blur-[100px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-blue-500/[0.02] to-transparent blur-[120px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        />
        <div
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-purple-500/[0.015] blur-[80px] animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        />
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-10 max-w-2xl w-full"
        >
          {/* App Icon */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="mx-auto w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#1c1c1e] to-[#0c0c0e] border border-white/10 shadow-2xl flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z"
              />
            </svg>
          </motion.div>

          {/* Hero Title */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl sm:text-7xl font-bold text-white tracking-tight leading-tight font-display"
            >
              Spotify <span className="text-white/40">Radio</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-[#86868B] text-lg sm:text-xl font-medium max-w-md mx-auto leading-relaxed"
            >
              De intelligente, naadloze live-radio ervaring — speciaal voor jou samengesteld door AI.
            </motion.p>
          </div>

          {/* Quick feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {["DJ Presentator", "Weer Updates", "Nieuws", "Slimme Rotatie", "10 Zenders"].map(
              (feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full text-xs font-medium text-white/50 bg-[#1C1C1E]/50 backdrop-blur-md border border-white/[0.05]"
                >
                  {feature}
                </span>
              )
            )}
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mx-auto mt-4 max-w-md px-4 py-3 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-sm font-medium">
                  Sessie verlopen of aanmelden mislukt. Probeer het opnieuw.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 30 }}
            className="pt-4"
          >
            <button
              onClick={() => (window.location.href = "/api/spotify/login")}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-[17px] transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(255,255,255,0.15)]"
            >
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Verbind met Spotify
              <svg
                className="w-4 h-4 ml-1 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="mt-4 text-[11px] font-medium text-[#86868B] tracking-wide uppercase">
              Spotify Premium vereist · Gratis te gebruiken
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="px-6 py-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Alles wat je nodig hebt
          </h2>
          <p className="text-[#86868B] text-base max-w-lg mx-auto">
            Een complete radio-ervaring gebouwd op de beste technologie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group p-6 rounded-3xl bg-[#111113] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/[0.06]"
                style={{ backgroundColor: `${feature.color}10` }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  style={{ color: feature.color }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-white/35 text-xs leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-6 py-20 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Hoe het werkt
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Verbind Spotify",
              desc: "Log in met je Spotify Premium account — veilig en beveiligd via OAuth.",
            },
            {
              step: "02",
              title: "Kies een zender",
              desc: "Draai aan de FM dial om je favoriete genre-zender te selecteren.",
            },
            {
              step: "03",
              title: "Geniet",
              desc: "Luister naar je gepersonaliseerde radio met DJ, weer en nieuws.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white/[0.04] mb-3">{item.step}</div>
              <h3 className="text-white font-semibold text-base mb-2 -mt-4">{item.title}</h3>
              <p className="text-white/35 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-12 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z"
              />
            </svg>
            <span className="text-white/20 text-xs font-medium">Spotify Radio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-white/20 text-xs hover:text-white/50 transition-colors">
              Over
            </Link>
            <Link href="/privacy" className="text-white/20 text-xs hover:text-white/50 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/20 text-xs hover:text-white/50 transition-colors">
              Voorwaarden
            </Link>
          </div>
          <span className="text-white/10 text-[10px]">
            © {new Date().getFullYear()} Spotify Radio. Niet gelieerd aan Spotify AB.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-radio-bg">
          <div className="w-12 h-12 border-4 border-radio-accent/30 border-t-radio-accent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
