"use client";

import { useEffect, useRef, useState } from "react";
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

  const [style, setStyle] = useState<"bars" | "wave" | "circular">("bars");

  // Listen for style changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sr_viz_style") as "bars" | "wave" | "circular";
      if (saved) setStyle(saved);

      const handleStyleChange = (e: Event) => {
        const customEvent = e as CustomEvent<"bars" | "wave" | "circular">;
        setStyle(customEvent.detail);
      };
      window.addEventListener("vizStyleChange", handleStyleChange);
      return () => window.removeEventListener("vizStyleChange", handleStyleChange);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      // Reset visuals to default "off" state
      for (let i = 0; i < BAR_COUNT; i++) {
        const height = style === "circular" ? "10%" : "3%";
        const bg = "rgba(255,255,255,0.05)";

        if (glowRefs.current[i]) {
          glowRefs.current[i]!.style.height = height;
          glowRefs.current[i]!.style.background = bg;
          glowRefs.current[i]!.style.opacity = "0.05";
        }
        if (mainRefs.current[i]) {
          mainRefs.current[i]!.style.height = height;
          mainRefs.current[i]!.style.background = "rgba(255,255,255,0.1)";
          if (style === "wave") {
            mainRefs.current[i]!.style.opacity = "0.4";
            mainRefs.current[i]!.style.width = "8px";
          } else if (style === "circular") {
            mainRefs.current[i]!.style.opacity = "0.15";
            mainRefs.current[i]!.style.transform = `rotate(${(i / BAR_COUNT) * 360}deg) translateY(-20px)`;
          } else {
            mainRefs.current[i]!.style.opacity = "0.15";
            mainRefs.current[i]!.style.width = "3px";
            mainRefs.current[i]!.style.transform = "none";
          }
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
            // Base calculation
            let base = Math.sin(time / 400 + i * 0.25) * 30 + 45;
            const random = Math.random() * 25;
            const center = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
            const centerBoost = (1 - center) * 25;

            // Add low end punch
            const lowEnd = i < BAR_COUNT * 0.3 ? Math.random() * 20 : 0;
            heightVal = Math.max(5, Math.min(98, base + random + centerBoost + lowEnd));

            // Style-specific adjustments
            if (style === "wave") {
              heightVal = Math.sin(time / 300 + i * 0.3) * 40 + 50 + (Math.random() * 10);
            } else if (style === "circular") {
              heightVal = Math.max(10, Math.min(100, (base + random) * 0.8));
            }
          }

          const heightStr = `${heightVal}%`;
          const activeColor = getBarColor(i, isAnnouncerSpeaking, genreColor);

          // Update Glow
          if (glowRefs.current[i]) {
            glowRefs.current[i]!.style.height = heightStr;
            glowRefs.current[i]!.style.background = activeColor;
            glowRefs.current[i]!.style.opacity = style === "circular" ? "0.1" : "0.35";
          }

          // Update Main
          if (mainRefs.current[i]) {
            mainRefs.current[i]!.style.height = heightStr;
            mainRefs.current[i]!.style.background = activeColor;
            mainRefs.current[i]!.style.opacity = style === "wave" ? "0.6" : "0.9";

            if (style === "wave") {
              mainRefs.current[i]!.style.width = "8px"; // Fatter bars for wave illusion
              mainRefs.current[i]!.style.transform = "none";
              mainRefs.current[i]!.style.borderRadius = "4px";
            } else if (style === "circular") {
              const angle = (i / BAR_COUNT) * 360;
              mainRefs.current[i]!.style.width = "3px";
              mainRefs.current[i]!.style.transform = `rotate(${angle}deg) translateY(-${heightVal * 0.4}px)`;
              mainRefs.current[i]!.style.transformOrigin = "bottom center";
            } else {
              mainRefs.current[i]!.style.width = "3px";
              mainRefs.current[i]!.style.transform = "none";
              mainRefs.current[i]!.style.borderRadius = "9999px";
            }
          }

          // Update Reflection (only for bars/wave)
          if (reflectionRefs.current[i]) {
            if (style === "circular") {
              reflectionRefs.current[i]!.style.opacity = "0";
            } else {
              reflectionRefs.current[i]!.style.opacity = "0.15";
              const reflectHeight = `${Math.min(heightVal, 50)}%`;
              reflectionRefs.current[i]!.style.height = reflectHeight;
              reflectionRefs.current[i]!.style.background = `linear-gradient(to top, rgba(255,255,255,0.25), transparent)`;
              reflectionRefs.current[i]!.style.width = style === "wave" ? "8px" : "3px";
            }
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
  }, [isPlaying, isAnnouncerSpeaking, genreColor, style]);

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
