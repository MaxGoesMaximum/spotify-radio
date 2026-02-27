"use client";

import { useEffect, useState } from "react";
import { getTimeGradient } from "@/lib/utils";
import { useRadioStore } from "@/store/radio-store";
import { useTheme } from "@/config/theme-context";

// Generate particles once
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
    opacity: Math.random() * 0.3 + 0.1,
  }));
}

export function BackgroundGradient() {
  const [gradient, setGradient] = useState(getTimeGradient());
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const { theme } = useTheme();

  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);

  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateParticles(theme.particleCount));
  }, [theme.particleCount]);

  useEffect(() => {
    setGradient(getTimeGradient());
    const interval = setInterval(() => {
      setGradient(getTimeGradient());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const albumUrl = currentTrack?.album?.images?.[0]?.url;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden transition-theme">
      {/* Base dark background — theme-aware */}
      <div
        className="absolute inset-0 transition-colors duration-[1000ms]"
        style={{ backgroundColor: theme.colors.bg }}
      />

      {/* Album art blurred background */}
      {albumUrl && isPlaying && (
        <div
          className="absolute inset-0 transition-all duration-[2000ms] opacity-25"
          style={{
            backgroundImage: `url(${albumUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(100px) saturate(1.8) brightness(0.6)",
          }}
        />
      )}

      {/* Time-based gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-[5000ms]`}
      />

      {/* Animated floating orbs — theme-aware colors + intensity */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-float"
        style={{
          backgroundColor: `${theme.colors.accent}${Math.round(theme.glowIntensity * 8).toString(16).padStart(2, "0")}`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-float"
        style={{
          backgroundColor: `${theme.colors.glow}${Math.round(theme.glowIntensity * 6).toString(16).padStart(2, "0")}`,
          animationDelay: "-3s",
        }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full blur-[100px] animate-float"
        style={{
          backgroundColor: `#4a9eff${Math.round(theme.glowIntensity * 6).toString(16).padStart(2, "0")}`,
          animationDelay: "-1.5s",
        }}
      />
      <div
        className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px] animate-float"
        style={{
          backgroundColor: `#fbbf24${Math.round(theme.glowIntensity * 5).toString(16).padStart(2, "0")}`,
          animationDelay: "-4.5s",
        }}
      />

      {/* Floating particles — count controlled by theme */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            backgroundColor: theme.colors.textPrimary,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}
