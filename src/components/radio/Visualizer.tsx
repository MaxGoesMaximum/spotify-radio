"use client";

import { useEffect, useRef } from "react";
import { useRadioStore } from "@/store/radio-store";
import { getStationColor } from "@/config/stations";

const BAR_COUNT = 48;

export function Visualizer() {
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const isAnnouncerSpeaking = useRadioStore((s) => s.isAnnouncerSpeaking);
  const currentGenre = useRadioStore((s) => s.currentGenre);

  const frameRef = useRef<number>();

  // Refs to the actual DOM elements to bypass React state on every frame
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reflectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const genreColor = getStationColor(currentGenre);

  // Apple Dark monochrome aesthetic with subtle gradient
  const getBarColor = (i: number, isSpeaking: boolean, baseColor: string) => {
    return isSpeaking
      ? `linear-gradient(to top, ${baseColor}cc, ${baseColor}66)`
      : `linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4))`;
  };

  useEffect(() => {
    if (!isPlaying) {
      // Reset visuals to default "off" state
      for (let i = 0; i < BAR_COUNT; i++) {
        const height = "3%";
        const bg = "rgba(255,255,255,0.05)";

        if (glowRefs.current[i]) {
          glowRefs.current[i]!.style.height = height;
          glowRefs.current[i]!.style.background = bg;
          glowRefs.current[i]!.style.opacity = "0.05";
        }
        if (mainRefs.current[i]) {
          mainRefs.current[i]!.style.height = height;
          mainRefs.current[i]!.style.background = "rgba(255,255,255,0.1)";
          mainRefs.current[i]!.style.opacity = "0.15";
        }
        if (reflectionRefs.current[i]) {
          reflectionRefs.current[i]!.style.height = height;
          reflectionRefs.current[i]!.style.background = bg;
        }
      }
      return;
    }

    let lastTime = 0;
    const interval = 60;

    const animate = (time: number) => {
      if (time - lastTime > interval) {
        for (let i = 0; i < BAR_COUNT; i++) {
          let heightVal = 5;

          if (isAnnouncerSpeaking) {
            const wave = Math.sin(time / 300 + i * 0.5) * 20 + 30;
            const slow = Math.sin(time / 800 + i * 0.2) * 15;
            heightVal = Math.max(5, Math.min(70, wave + slow));
          } else {
            const base = Math.sin(time / 400 + i * 0.25) * 30 + 45;
            const random = Math.random() * 25;
            const center = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
            const centerBoost = (1 - center) * 25;
            const lowEnd = i < BAR_COUNT * 0.3 ? Math.random() * 15 : 0;
            heightVal = Math.max(5, Math.min(98, base + random + centerBoost + lowEnd));
          }

          const heightStr = `${heightVal}%`;
          const activeColor = getBarColor(i, isAnnouncerSpeaking, genreColor);

          // Update Glow
          if (glowRefs.current[i]) {
            glowRefs.current[i]!.style.height = heightStr;
            glowRefs.current[i]!.style.background = activeColor;
            glowRefs.current[i]!.style.opacity = "0.35";
          }

          // Update Main
          if (mainRefs.current[i]) {
            mainRefs.current[i]!.style.height = heightStr;
            mainRefs.current[i]!.style.background = activeColor;
            mainRefs.current[i]!.style.opacity = "0.9";
          }

          // Update Reflection
          if (reflectionRefs.current[i]) {
            const reflectHeight = `${Math.min(heightVal, 50)}%`;
            reflectionRefs.current[i]!.style.height = reflectHeight;
            reflectionRefs.current[i]!.style.background = `linear-gradient(to top, rgba(255,255,255,0.25), transparent)`;
          }
        }
        lastTime = time;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, isAnnouncerSpeaking, genreColor]);

  // Create static arrays for rendering
  const barsArray = Array.from({ length: BAR_COUNT });

  return (
    <div className="relative">
      {/* Glow layer */}
      <div
        className="absolute inset-0 flex items-end justify-center gap-[2px] h-20 px-2 pointer-events-none"
        style={{ filter: "blur(8px)" }}
        aria-hidden="true"
      >
        {barsArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { glowRefs.current[i] = el; }}
            className="rounded-full"
            style={{
              width: "3px",
              height: "5%",
              background: "rgba(255,255,255,0.05)",
              opacity: 0.05,
              transition: "height 0.08s ease-out",
            }}
          />
        ))}
      </div>

      {/* Main bars */}
      <div className="flex items-end justify-center gap-[2px] h-20 px-2 relative z-10">
        {barsArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { mainRefs.current[i] = el; }}
            className="rounded-full"
            style={{
              width: "3px",
              height: "5%",
              background: "rgba(255,255,255,0.1)",
              opacity: 0.15,
              transition: "height 0.08s ease-out",
            }}
          />
        ))}
      </div>

      {/* Reflection */}
      <div
        className="flex items-start justify-center gap-[2px] h-6 px-2 overflow-hidden"
        style={{ transform: "scaleY(-1)", opacity: 0.15 }}
        aria-hidden="true"
      >
        {barsArray.map((_, i) => (
          <div
            key={i}
            ref={(el) => { reflectionRefs.current[i] = el; }}
            className="rounded-full"
            style={{
              width: "3px",
              height: "5%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
