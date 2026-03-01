"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type ThemeId, type ThemeConfig, getTheme, THEMES } from "./themes";

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.dark,
  themeId: "dark",
  setTheme: () => { },
});

const STORAGE_KEY = "spotify-radio-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("dark");

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES[stored]) {
        setThemeId(stored);
      }
    } catch { }
  }, []);

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const t = getTheme(themeId);
    const root = document.documentElement;
    root.style.setProperty("--theme-bg", t.colors.bg);
    root.style.setProperty("--theme-surface", t.colors.surface);
    root.style.setProperty("--theme-border", t.colors.border);
    root.style.setProperty("--theme-text-primary", t.colors.textPrimary);
    root.style.setProperty("--theme-text-secondary", t.colors.textSecondary);
    root.style.setProperty("--theme-text-dim", t.colors.textDim);
    root.style.setProperty("--theme-accent", t.colors.accent);
    root.style.setProperty("--theme-glow", t.colors.glow);
    root.style.setProperty("--theme-glass-opacity", String(t.glassOpacity));
    root.style.setProperty("--theme-border-opacity", String(t.borderOpacity));
    root.style.setProperty("--theme-glow-intensity", String(t.glowIntensity));

    // Set data-theme for CSS overrides (light themes need text color inversions)
    const lightThemes = ["light", "minimal"];
    if (lightThemes.includes(themeId)) {
      root.setAttribute("data-theme", themeId);
    } else if (themeId === "neon" || themeId === "retro") {
      root.setAttribute("data-theme", themeId);
    } else {
      root.removeAttribute("data-theme");
    }
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch { }
  }, []);

  const theme = getTheme(themeId);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
