// Theme configuration for the radio app

export type ThemeId = "dark" | "midnight" | "light" | "sunset" | "ocean" | "neon" | "retro" | "minimal";

export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textDim: string;
  accent: string;
  glow: string;
}

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  icon: string;
  colors: ThemeColors;
  glassOpacity: number;
  borderOpacity: number;
  blurAmount: string;
  particleCount: number;
  glowIntensity: number; // 0-1
}

export const THEMES: Record<string, ThemeConfig> = {
  dark: {
    id: "dark",
    label: "Apple Dark",
    icon: "\u25cf", // Black circle
    colors: {
      bg: "#000000",
      surface: "#1C1C1E",
      border: "rgba(255, 255, 255, 0.1)",
      textPrimary: "#FFFFFF",
      textSecondary: "rgba(255, 255, 255, 0.6)",
      textDim: "rgba(255, 255, 255, 0.3)",
      accent: "#0A84FF", // Apple Blue
      glow: "#0A84FF",
    },
    glassOpacity: 0.05,
    borderOpacity: 0.1,
    blurAmount: "blur-3xl",
    particleCount: 0,
    glowIntensity: 0.1,
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    icon: "\u263e", // Moon
    colors: {
      bg: "#050510",
      surface: "#10101c",
      border: "rgba(255, 255, 255, 0.08)",
      textPrimary: "#F5F5F7",
      textSecondary: "rgba(245, 245, 247, 0.55)",
      textDim: "rgba(245, 245, 247, 0.25)",
      accent: "#5E5CE6", // Apple Indigo
      glow: "#5E5CE6",
    },
    glassOpacity: 0.03,
    borderOpacity: 0.08,
    blurAmount: "blur-2xl",
    particleCount: 0,
    glowIntensity: 0.2,
  },
  light: {
    id: "light",
    label: "Light",
    icon: "\u2600", // Sun
    colors: {
      bg: "#F5F5F7",
      surface: "#FFFFFF",
      border: "rgba(0, 0, 0, 0.08)",
      textPrimary: "#1D1D1F",
      textSecondary: "rgba(29, 29, 31, 0.6)",
      textDim: "rgba(29, 29, 31, 0.3)",
      accent: "#007AFF",
      glow: "#007AFF",
    },
    glassOpacity: 0.6,
    borderOpacity: 0.08,
    blurAmount: "blur-3xl",
    particleCount: 0,
    glowIntensity: 0.05,
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    icon: "\uD83C\uDF05", // Sunrise emoji
    colors: {
      bg: "#1A0A0A",
      surface: "#261414",
      border: "rgba(255, 150, 100, 0.12)",
      textPrimary: "#FFF5F0",
      textSecondary: "rgba(255, 245, 240, 0.6)",
      textDim: "rgba(255, 245, 240, 0.3)",
      accent: "#FF6B35",
      glow: "#FF4500",
    },
    glassOpacity: 0.04,
    borderOpacity: 0.12,
    blurAmount: "blur-2xl",
    particleCount: 0,
    glowIntensity: 0.25,
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    icon: "\uD83C\uDF0A", // Wave emoji
    colors: {
      bg: "#041018",
      surface: "#0A1A28",
      border: "rgba(100, 200, 255, 0.1)",
      textPrimary: "#E8F4FF",
      textSecondary: "rgba(232, 244, 255, 0.6)",
      textDim: "rgba(232, 244, 255, 0.25)",
      accent: "#06B6D4",
      glow: "#0891B2",
    },
    glassOpacity: 0.04,
    borderOpacity: 0.1,
    blurAmount: "blur-2xl",
    particleCount: 0,
    glowIntensity: 0.2,
  },
  neon: {
    id: "neon",
    label: "Neon",
    icon: "\u26A1", // Lightning bolt
    colors: {
      bg: "#0a0a0f",
      surface: "#12121a",
      border: "rgba(0, 255, 255, 0.15)",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.7)",
      textDim: "rgba(255, 255, 255, 0.35)",
      accent: "#00ffff",
      glow: "#ff00ff",
    },
    glassOpacity: 0.06,
    borderOpacity: 0.15,
    blurAmount: "blur-2xl",
    particleCount: 30,
    glowIntensity: 0.6,
  },
  retro: {
    id: "retro",
    label: "Retro",
    icon: "\uD83D\uDCFB", // Radio emoji
    colors: {
      bg: "#1a1408",
      surface: "#241e10",
      border: "rgba(212, 162, 82, 0.12)",
      textPrimary: "#f5e6c8",
      textSecondary: "rgba(245, 230, 200, 0.6)",
      textDim: "rgba(245, 230, 200, 0.3)",
      accent: "#d4a252",
      glow: "#b8860b",
    },
    glassOpacity: 0.05,
    borderOpacity: 0.12,
    blurAmount: "blur-xl",
    particleCount: 0,
    glowIntensity: 0.15,
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    icon: "\u25CB", // White circle
    colors: {
      bg: "#fafafa",
      surface: "#ffffff",
      border: "rgba(0, 0, 0, 0.06)",
      textPrimary: "#111111",
      textSecondary: "rgba(17, 17, 17, 0.55)",
      textDim: "rgba(17, 17, 17, 0.3)",
      accent: "#111111",
      glow: "#666666",
    },
    glassOpacity: 0.7,
    borderOpacity: 0.06,
    blurAmount: "blur-3xl",
    particleCount: 0,
    glowIntensity: 0,
  },
};

export function getTheme(id: string): ThemeConfig {
  return THEMES[id] || THEMES.dark;
}
