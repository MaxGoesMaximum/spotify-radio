"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RadioPlayer } from "@/components/radio/RadioPlayer";
import { AmbientBackground } from "@/components/radio/AmbientBackground";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { ConnectionBanner } from "@/components/ui/ConnectionBanner";
import { WelcomeOverlay } from "@/components/ui/WelcomeOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotifySession } from "@/hooks/useSpotifySession";
import { useRadioStore } from "@/store/radio-store";
import { useTheme } from "@/config/theme-context";
import { decodePreset } from "@/services/station-presets";

function PresetLoader() {
  const searchParams = useSearchParams();
  const setGenre = useRadioStore((s) => s.setGenre);
  const { setTheme } = useTheme();

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (presetParam) {
      const preset = decodePreset(presetParam);
      if (preset) {
        setGenre(preset.stationId);
        setTheme(preset.themeId);
      }
    }
  }, [searchParams, setGenre, setTheme]);

  return null;
}

function RadioPageContent() {
  const { session, status } = useSpotifySession();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const setUserName = useRadioStore((s) => s.setUserName);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Set user name for DJ personalization
  useEffect(() => {
    if (session?.user?.name) {
      // Use first name only for natural DJ speech
      const firstName = session.user.name.split(" ")[0];
      setUserName(firstName);
    }
  }, [session?.user?.name, setUserName]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radio-bg">
        <div className="flex flex-col items-center gap-5">
          {/* Skeleton Loader for initial app load */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-radio-accent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-radio-accent/10 animate-pulse" />
          </div>
          <div className="h-2 w-24 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen relative overflow-hidden w-full max-w-[100vw]">
      <AmbientBackground />
      <ConnectionBanner />
      <WelcomeOverlay />

      {/* Preset loader (reads URL params) */}
      <Suspense fallback={null}>
        <PresetLoader />
      </Suspense>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </AnimatePresence>

      {/* ═══ Header ═══ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-radio-bg/60 backdrop-blur-xl border-b border-white/[0.04] shadow-sm"
      >
        {/* Logo + brand */}
        <div className="flex flex-1 items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-radio-accent to-radio-glow flex items-center justify-center shadow-lg shadow-radio-accent/20">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z"
              />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-white font-bold text-lg sm:text-xl leading-none font-heading tracking-tight">
              Spotify{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-radio-accent to-radio-glow">
                Radio
              </span>
            </span>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium mt-0.5">
              Live Experience
            </span>
          </div>
        </div>

        {/* Right side: Settings + User */}
        <div className="flex items-center gap-3 sm:gap-4">

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white"
            aria-label="Instellingen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* User Profile Block */}
          {session.user?.image && (
            <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-white/[0.08]">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-white/90 text-sm font-medium leading-none">{session.user?.name}</span>
                <span className="text-white/40 text-[10px] uppercase font-medium mt-1">Premium</span>
              </div>
              <img
                src={session.user.image}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 shadow-lg object-cover"
              />
            </div>
          )}
        </div>
      </motion.header>

      {/* ═══ Main content ═══ */}
      <main className="relative z-10 px-3 sm:px-4 pt-6 pb-8">
        <RadioPlayer accessToken={session.accessToken} />
      </main>

      {/* ═══ Footer branding ═══ */}
      <footer className="relative z-10 text-center pb-24 pt-4 space-y-2">
        <p className="text-[10px] text-white/[0.08] uppercase tracking-[0.3em] font-medium">
          Spotify Radio \u00b7 Powered by Next.js & Edge TTS
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/privacy" className="text-white/[0.06] text-[9px] hover:text-white/20 transition-colors">Privacy</a>
          <span className="text-white/[0.04]">·</span>
          <a href="/terms" className="text-white/[0.06] text-[9px] hover:text-white/20 transition-colors">Voorwaarden</a>
          <span className="text-white/[0.04]">·</span>
          <a href="/about" className="text-white/[0.06] text-[9px] hover:text-white/20 transition-colors">Over</a>
        </div>
      </footer>
    </div>
  );
}

export default function RadioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-radio-bg">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-radio-accent/15 border-t-radio-accent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-radio-accent/5" />
          </div>
          <p className="text-white/20 text-xs tracking-widest uppercase">Even geduld...</p>
        </div>
      </div>
    }>
      <RadioPageContent />
    </Suspense>
  );
}
