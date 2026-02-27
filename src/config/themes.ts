// Theme configuration for the radio app

export type ThemeId = "dark" | "midnight" | "light" | "sunset" | "ocean";

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
  // Fallbacks for legacy localStorage values
  neon: {
    id: "dark",
    label: "Apple Dark",
    icon: "\u25cf",
    colors: { bg: "#000000", surface: "#1C1C1E", border: "rgba(255, 255, 255, 0.1)", textPrimary: "#FFFFFF", textSecondary: "rgba(255, 255, 255, 0.6)", textDim: "rgba(255, 255, 255, 0.3)", accent: "#0A84FF", glow: "#0A84FF" },
    glassOpacity: 0.05, borderOpacity: 0.1, blurAmount: "blur-3xl", particleCount: 0, glowIntensity: 0.1,
  },
  retro: {
    id: "dark", label: "Apple Dark", icon: "\u25cf", colors: { bg: "#000000", surface: "#1C1C1E", border: "rgba(255, 255, 255, 0.1)", textPrimary: "#FFFFFF", textSecondary: "rgba(255, 255, 255, 0.6)", textDim: "rgba(255, 255, 255, 0.3)", accent: "#0A84FF", glow: "#0A84FF" }, glassOpacity: 0.05, borderOpacity: 0.1, blurAmount: "blur-3xl", particleCount: 0, glowIntensity: 0.1,
  },
  minimal: {
    id: "dark", label: "Apple Dark", icon: "\u25cf", colors: { bg: "#000000", surface: "#1C1C1E", border: "rgba(255, 255, 255, 0.1)", textPrimary: "#FFFFFF", textSecondary: "rgba(255, 255, 255, 0.6)", textDim: "rgba(255, 255, 255, 0.3)", accent: "#0A84FF", glow: "#0A84FF" }, glassOpacity: 0.05, borderOpacity: 0.1, blurAmount: "blur-3xl", particleCount: 0, glowIntensity: 0.1,
  },
};

export function getTheme(id: string): ThemeConfig {
  return THEMES[id] || THEMES.dark;
}
