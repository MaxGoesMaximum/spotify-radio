"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "@/config/theme-context";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string; // Color for glow effect
  noPadding?: boolean;
}

export function GlassCard({ children, className, hover = false, glow, noPadding }: GlassCardProps) {
  const { theme } = useTheme();

  const blurPx = theme.blurAmount === "blur-2xl" ? 24 : theme.blurAmount === "blur-xl" ? 16 : 12;

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl overflow-hidden transition-theme",
        hover && "transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.12] cursor-pointer",
        noPadding ? "" : "",
        className
      )}
      style={{
        background: `rgba(255, 255, 255, ${theme.glassOpacity})`,
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        border: `1px solid rgba(255, 255, 255, ${theme.borderOpacity})`,
        boxShadow: glow
          ? `0 0 ${Math.round(40 * theme.glowIntensity)}px ${glow}12, 0 0 ${Math.round(80 * theme.glowIntensity)}px ${glow}06, inset 0 1px 0 rgba(255,255,255,0.03)`
          : `0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Top highlight strip — subtle inset light */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent 10%, rgba(255, 255, 255, ${Math.min(theme.borderOpacity * 1.5, 0.15)}) 50%, transparent 90%)`,
        }}
      />

      {/* Inner ambient light at top */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
