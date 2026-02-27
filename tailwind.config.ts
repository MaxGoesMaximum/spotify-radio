import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        radio: {
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          accent: "var(--theme-accent)",
          glow: "var(--theme-glow)",
          blue: "#4a9eff",
          purple: "#8b5cf6",
          gold: "#fbbf24",
          green: "#22c55e",
          border: "var(--theme-border)",
          "text-dim": "var(--theme-text-dim)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        heading: [
          "var(--font-heading)",
          "var(--font-display)",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "eq-bar": "eq-bar 0.5s ease-in-out infinite alternate",
        "slide-left": "slide-left 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-particle": "float-particle 20s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "speaking-pulse": "speakingPulse 1.5s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(255, 68, 68, 0.8)",
          },
          "50%": {
            opacity: "0.7",
            boxShadow: "0 0 40px rgba(255, 68, 68, 1)",
          },
        },
        "eq-bar": {
          "0%": { height: "10%" },
          "100%": { height: "100%" },
        },
        "slide-left": {
          "0%": { transform: "translateX(50%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-particle": {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": {
            transform: "translateY(-100vh) translateX(30px)",
            opacity: "0",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        speakingPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
