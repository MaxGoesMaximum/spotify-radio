// ═══════════════════════════════════════════════════════════════
//  GERMAN STRINGS — UI text translations
// ═══════════════════════════════════════════════════════════════

import type { TranslationKey } from "./nl";

export const de: Record<TranslationKey, string> = {
  // App
  app_title: "Spotify Radio",
  app_subtitle: "Live Radio Erlebnis",
  app_tagline: "Dein Eigener Radiosender",
  app_description: "Hore deine Lieblingsmusik mit einem echten Radio-Erlebnis, komplett mit DJ, Wetter und Nachrichten.",

  // Connection
  connecting: "Verbindung mit Spotify...",
  connecting_description: "Dein Spotify Premium Konto wird mit dem Radio-Player verbunden.",
  loading: "Bitte warten...",

  // Player controls
  play: "Abspielen",
  pause: "Pause",
  skip: "Nachster Titel",
  select_station: "Wahle einen Sender, um zu beginnen",

  // Now playing
  now_playing: "Jetzt spielt",
  dj_speaking: "DJ spricht",

  // Weather
  weather_loading: "Wetter wird geladen...",
  weather_not_available: "Wetter nicht verfugbar",
  weather_feels_like: "Fuhlt sich an wie",
  weather_humidity: "Feuchtigkeit",
  weather_wind: "Wind",
  weather_location: "Standort",
  weather_advice_cold: "Zieh deine warme Jacke an!",
  weather_advice_hot: "Vergiss deine Sonnencreme nicht!",
  weather_advice_rain: "Nimm einen Regenschirm mit!",
  weather_advice_nice: "Geniess das Wetter!",

  // News
  news: "Nachrichten",
  news_loading: "Nachrichten werden geladen...",
  news_latest: "Neueste Nachrichten",
  news_read_more: "Mehr lesen",
  news_close: "Schliessen",

  // Share
  share: "Teilen",
  share_as_text: "Als Text teilen",
  share_as_image: "Als Bild teilen",
  share_preset: "Sender-Preset teilen",
  share_generating: "Wird erstellt...",
  share_link_copied: "Link kopiert!",
  share_preset_copied: "Preset-Link kopiert!",
  share_image_saved: "Bild gespeichert!",
  share_image_error: "Fehler beim Erstellen des Bildes",
  share_text_template: "Ich hore {track} von {artist} auf {station}!",

  // Sleep timer
  sleep_timer: "Schlaf-Timer",

  // Song history
  history: "Verlauf",

  // Listeners
  listeners: "Zuhorer",

  // Theme
  theme_neon: "Neon",
  theme_retro: "Retro",
  theme_minimal: "Minimal",

  // Favorites
  add_favorite: "Zu Favoriten hinzufugen",
  remove_favorite: "Aus Favoriten entfernen",

  // Time of day
  morning: "Morgen",
  afternoon: "Nachmittag",
  evening: "Abend",
  night: "Nacht",

  // DJ greetings
  greeting_morning: "Guten Morgen",
  greeting_afternoon: "Guten Tag",
  greeting_evening: "Guten Abend",
  greeting_night: "Gute Nacht",
};
