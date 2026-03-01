// ═══════════════════════════════════════════════════════════════
//  i18n — Translation system (NL, EN, DE)
// ═══════════════════════════════════════════════════════════════

import { nl, type TranslationKey } from "./nl";
import { en } from "./en";
import { de } from "./de";

export type Locale = "nl" | "en" | "de";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  nl,
  en,
  de,
};

// Reactive locale state (read from localStorage or default to "nl")
let currentLocale: Locale = "nl";

if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("sr_locale");
    if (stored && (stored === "nl" || stored === "en" || stored === "de")) {
      currentLocale = stored;
    }
  } catch {}
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Set the current locale (persists to localStorage)
 */
export function setLocale(locale: Locale) {
  currentLocale = locale;
  try {
    localStorage.setItem("sr_locale", locale);
  } catch {}
}

/**
 * Get a translated string by key
 * Supports interpolation: t("share_text_template", { track: "Song", artist: "Artist" })
 */
export function t(key: TranslationKey, params?: Record<string, string>): string {
  let text: string = translations[currentLocale]?.[key] || translations.nl[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }

  return text;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  nl: "🇳🇱",
  en: "🇬🇧",
  de: "🇩🇪",
};

export type { TranslationKey };
