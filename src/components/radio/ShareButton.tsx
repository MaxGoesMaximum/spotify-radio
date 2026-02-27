"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { generateShareCard } from "@/services/share-card";
import { generatePresetUrl } from "@/services/station-presets";
import { getStation } from "@/config/stations";
import { useToast } from "@/components/ui/Toast";

export function ShareButton() {
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const currentGenre = useRadioStore((s) => s.currentGenre);
  const themeId = useRadioStore((s) => s.themeId);
  const [showModal, setShowModal] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Click-outside-to-close
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showModal]);

  const handleShareText = useCallback(async () => {
    if (!currentTrack) return;

    const station = getStation(currentGenre);
    const text = `Ik luister naar ${currentTrack.name} van ${currentTrack.artists[0].name} op ${station.label}!`;
    const url = `https://open.spotify.com/track/${currentTrack.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: currentTrack.name, text, url });
        setShowModal(false);
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast("Link gekopieerd!", "success");
      setShowModal(false);
    } catch {}
  }, [currentTrack, currentGenre, toast]);

  const handleShareImage = useCallback(async () => {
    if (!currentTrack) return;
    setIsGeneratingImage(true);

    try {
      const blobUrl = await generateShareCard({
        track: currentTrack,
        stationId: currentGenre,
      });

      if (blobUrl) {
        if (navigator.share && navigator.canShare) {
          const response = await fetch(blobUrl);
          const blob = await response.blob();
          const file = new File([blob], "now-playing.png", { type: "image/png" });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${currentTrack.name} - ${currentTrack.artists[0].name}`,
            });
            setShowModal(false);
            URL.revokeObjectURL(blobUrl);
            return;
          }
        }

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `now-playing-${currentTrack.name.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
        a.click();
        toast("Afbeelding opgeslagen!", "success");
        URL.revokeObjectURL(blobUrl);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Share card error:", err);
      toast("Fout bij maken afbeelding", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  }, [currentTrack, currentGenre, toast]);

  const handleSharePreset = useCallback(async () => {
    const url = generatePresetUrl({ stationId: currentGenre, themeId });
    try {
      await navigator.clipboard.writeText(url);
      toast("Preset link gekopieerd!", "success");
      setShowModal(false);
    } catch {}
  }, [currentGenre, themeId, toast]);

  if (!currentTrack) return null;

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setShowModal(!showModal)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        className="p-2 rounded-full hover:bg-white/[0.06] transition-all group"
        title="Delen"
        aria-label="Nummer delen"
      >
        <svg
          className="w-[18px] h-[18px] text-white/30 group-hover:text-white/60 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-radio-surface/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={handleShareText}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                Deel als tekst
              </button>
              <button
                onClick={handleShareImage}
                disabled={isGeneratingImage}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-all disabled:opacity-40"
              >
                {isGeneratingImage ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 002.25 6v12z" />
                  </svg>
                )}
                {isGeneratingImage ? "Genereren..." : "Deel als afbeelding"}
              </button>
              <button
                onClick={handleSharePreset}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Deel station preset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
