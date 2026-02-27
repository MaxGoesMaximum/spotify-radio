"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";

const WEATHER_ICONS: Record<string, string> = {
  "01d": "\u2600\uFE0F", "01n": "\uD83C\uDF19",
  "02d": "\u26C5", "02n": "\u2601\uFE0F",
  "03d": "\u2601\uFE0F", "03n": "\u2601\uFE0F",
  "04d": "\u2601\uFE0F", "04n": "\u2601\uFE0F",
  "09d": "\uD83C\uDF27\uFE0F", "09n": "\uD83C\uDF27\uFE0F",
  "10d": "\uD83C\uDF26\uFE0F", "10n": "\uD83C\uDF27\uFE0F",
  "11d": "\u26C8\uFE0F", "11n": "\u26C8\uFE0F",
  "13d": "\u2744\uFE0F", "13n": "\u2744\uFE0F",
  "50d": "\uD83C\uDF2B\uFE0F", "50n": "\uD83C\uDF2B\uFE0F",
};

function formatLastUpdated(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export function WeatherWidget() {
  const weather = useRadioStore((s) => s.weather);
  const weatherLastUpdated = useRadioStore((s) => s.weatherLastUpdated);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setExpanded(false);
    }
  }, []);

  useEffect(() => {
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [expanded, handleClickOutside]);

  // Loading skeleton
  if (!weather) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-7 h-7 rounded-full bg-white/5" />
        <div className="flex flex-col gap-1">
          <div className="w-10 h-4 rounded bg-white/5" />
          <div className="w-14 h-2 rounded bg-white/5" />
        </div>
      </div>
    );
  }

  const icon = WEATHER_ICONS[weather.icon] || "\uD83C\uDF24\uFE0F";

  return (
    <div className="relative" ref={cardRef}>
      <motion.button
        onClick={() => setExpanded(!expanded)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 text-white/70 hover:text-white/90 transition-colors cursor-pointer"
        aria-label={`Weer: ${Math.round(weather.temp)} graden in ${weather.city}`}
        aria-expanded={expanded}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex flex-col text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">
              {Math.round(weather.temp)}°
            </span>
            <span className="text-[10px] text-white/30">C</span>
          </div>
          <span className="text-[10px] text-white/30 capitalize">
            {weather.city}
          </span>
        </div>
      </motion.button>

      {/* Expanded weather card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-radio-surface/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 p-4"
            role="dialog"
            aria-label="Weerdetails"
          >
            {/* Header with icon and temp */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <span className="text-5xl block">{icon}</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {Math.round(weather.temp)}°C
                </div>
                <div className="text-xs text-white/40 capitalize">
                  {weather.description}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider">
                  Voelt als
                </div>
                <div className="text-white font-bold">
                  {Math.round(weather.feels_like)}°C
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider">
                  Vocht
                </div>
                <div className="text-white font-bold">{weather.humidity}%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider">
                  Wind
                </div>
                <div className="text-white font-bold">
                  {Math.round(weather.wind_speed)} km/h
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider">
                  Locatie
                </div>
                <div className="text-white font-bold truncate">
                  {weather.city}
                </div>
              </div>
            </div>

            {/* Advice */}
            <div className="mt-3 text-[11px] text-white/30 text-center">
              {weather.temp < 5
                ? "Trek je warme jas aan!"
                : weather.temp > 25
                  ? "Vergeet je zonnebrand niet!"
                  : weather.description.toLowerCase().includes("rain")
                    ? "Neem een paraplu mee!"
                    : "Geniet van het weer!"}
            </div>
            {weatherLastUpdated != null && (
              <div className="mt-2 text-[10px] text-white/20 text-center">
                Laatst geüpdatet om {formatLastUpdated(weatherLastUpdated)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
