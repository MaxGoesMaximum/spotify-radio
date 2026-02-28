"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { useToastStore } from "@/store/toast-store";
import type { CustomStationConfig } from "@/types";

const CUSTOM_COLORS = [
  "#a855f7", "#ec4899", "#f97316", "#14b8a6",
  "#6366f1", "#f43f5e", "#eab308", "#22d3ee",
];

interface CustomStationBuilderProps {
  onClose: () => void;
  onStationCreated: () => void;
}

export function CustomStationBuilder({ onClose, onStationCreated }: CustomStationBuilderProps) {
  const customStations = useRadioStore((s) => s.customStations);
  const addCustomStation = useRadioStore((s) => s.addCustomStation);
  const removeCustomStation = useRadioStore((s) => s.removeCustomStation);
  const setActiveCustomStation = useRadioStore((s) => s.setActiveCustomStation);
  const addToast = useToastStore((s) => s.addToast);
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [terms, setTerms] = useState("");
  const [era, setEra] = useState<"all" | "modern" | "retro">("all");
  const [popularity, setPopularity] = useState<"all" | "underground" | "mainstream">("all");

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const searchTerms = terms.split(",").map((t) => t.trim()).filter(Boolean);

    if (!trimmedName) {
      addToast("Geef je zender een naam", "error", 2000);
      return;
    }
    if (searchTerms.length === 0) {
      addToast("Voeg minstens een zoekterm toe", "error", 2000);
      return;
    }
    if (customStations.length >= 5) {
      addToast("Maximum 5 eigen zenders bereikt", "error", 2000);
      return;
    }

    const currentYear = new Date().getFullYear();
    let yearRange = { min: 1960, max: currentYear };
    if (era === "modern") yearRange = { min: 2010, max: currentYear };
    if (era === "retro") yearRange = { min: 1960, max: 2009 };

    let popularityRange = { min: 20, max: 100 };
    if (popularity === "underground") popularityRange = { min: 0, max: 50 };
    if (popularity === "mainstream") popularityRange = { min: 50, max: 100 };

    const color = CUSTOM_COLORS[customStations.length % CUSTOM_COLORS.length];

    const station: CustomStationConfig = {
      id: `custom_${Date.now()}`,
      label: trimmedName,
      searchTerms,
      yearRange,
      popularityRange,
      color,
      icon: "\u2b50",
      isCustom: true,
    };

    addCustomStation(station);
    setActiveCustomStation(station.id);
    addToast(`Zender "${trimmedName}" aangemaakt!`, "success", 3000);
    onClose();
    onStationCreated();
  };

  const handleDelete = (id: string) => {
    removeCustomStation(id);
    addToast("Zender verwijderd", "info", 2000);
  };

  const handleActivate = (id: string) => {
    setActiveCustomStation(id);
    addToast("Eigen zender geactiveerd", "success", 2000);
    onClose();
    onStationCreated();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full max-w-md bg-radio-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">Eigen zender bouwen</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name input */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="bijv. Midnight Shoegaze"
              maxLength={40}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Search terms */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Artiest, genre of sfeer</label>
            <input
              type="text"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="bijv. Tame Impala, shoegaze, dreamy"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
            <p className="mt-1 text-[10px] text-white/20">Komma-gescheiden trefwoorden</p>
          </div>

          {/* Era selector */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Tijdperk</label>
            <div className="flex gap-2">
              {([["all", "Alles"], ["modern", "Modern (2010+)"], ["retro", "Retro"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setEra(val)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    era === val
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:bg-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Popularity selector */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Populariteit</label>
            <div className="flex gap-2">
              {([["all", "Alles"], ["underground", "Underground"], ["mainstream", "Mainstream"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPopularity(val)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    popularity === val
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:bg-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Existing custom stations */}
          {customStations.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Mijn zenders ({customStations.length}/5)
              </label>
              <div className="flex flex-wrap gap-2">
                {customStations.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] group"
                  >
                    <button
                      onClick={() => handleActivate(s.id)}
                      className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-0.5 rounded text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Annuleren
          </button>
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={customStations.length >= 5}
            className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-all disabled:opacity-30"
          >
            Zender aanmaken
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
