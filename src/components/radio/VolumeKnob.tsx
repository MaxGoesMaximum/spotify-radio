"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { cn } from "@/lib/utils";

export function VolumeKnob() {
  const volume = useRadioStore((s) => s.volume);
  const setVolume = useRadioStore((s) => s.setVolume);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const rotation = volume * 270 - 135; // -135 to 135 degrees
  const isMuted = volume === 0;

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (!knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(clientY - centerY, clientX - centerX);
      const degrees = (angle * 180) / Math.PI;

      // Map angle to volume (0-1)
      let normalized = (degrees + 135) / 270;
      normalized = Math.max(0, Math.min(1, normalized));
      setVolume(normalized);
    },
    [setVolume]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleInteraction(e.clientX, e.clientY);

      const handleMouseMove = (e: MouseEvent) => {
        handleInteraction(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleInteraction]
  );

  return (
    <div className="flex flex-col items-center gap-1.5" title={`Volume: ${Math.round(volume * 100)}% (\u2191\u2193)`}>
      <div className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-medium">
        {isMuted ? "Mute" : "Vol"}
      </div>

      {/* Knob container */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
        {/* Track marks */}
        {[...Array(11)].map((_, i) => {
          const markAngle = -135 + i * 27;
          const radian = (markAngle * Math.PI) / 180;
          const radius = 26;
          const cx = 32;
          const cy = 32;
          const x = cx + Math.cos(radian) * radius;
          const y = cy + Math.sin(radian) * radius;
          const active = i / 10 <= volume;
          return (
            <div
              key={i}
              className={cn(
                "absolute w-[3px] h-[3px] rounded-full transition-all duration-200",
                active ? "bg-radio-accent scale-110" : "bg-white/10"
              )}
              style={{ left: x - 1.5, top: y - 1.5 }}
            />
          );
        })}

        {/* Knob */}
        <motion.div
          ref={knobRef}
          className={cn(
            "absolute inset-2 rounded-full cursor-pointer select-none",
            "bg-gradient-to-b from-gray-600/80 to-gray-800/80",
            "border border-white/[0.06] shadow-lg",
            isDragging && "border-radio-accent/30 shadow-radio-accent/10"
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
          onMouseDown={handleMouseDown}
          whileHover={{ scale: 1.04 }}
        >
          {/* Indicator line */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[2px] h-2.5 bg-radio-accent rounded-full shadow-[0_0_6px_var(--theme-accent)]" />

          {/* Metallic shine */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
        </motion.div>
      </div>

      <div className="text-[10px] text-white/25 font-mono tabular-nums">
        {Math.round(volume * 100)}
      </div>
    </div>
  );
}
