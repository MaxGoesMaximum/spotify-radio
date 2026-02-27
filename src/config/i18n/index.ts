// ═══════════════════════════════════════════════════════════════
//  i18n — Translation system (NL only for now)
// ═══════════════════════════════════════════════════════════════

import { nl, type TranslationKey } from "./nl";

type Locale = "nl";

const translations: Record<Locale, typeof nl> = {
  nl,
};

const currentLocale: Locale = "nl";

/**
 * Get a translated string by key
 * Supports interpolation: t("share_text_template", { track: "Song", artist: "Artist" })
 */
export function t(key: TranslationKey, params?: Record<string, string>): string {
  let text: string = translations[currentLocale][key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }

  return text;
}

export type { TranslationKey };
