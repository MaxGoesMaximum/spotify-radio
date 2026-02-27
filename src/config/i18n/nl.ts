// ═══════════════════════════════════════════════════════════════
//  DUTCH STRINGS — All UI text extracted for future i18n
// ═══════════════════════════════════════════════════════════════

export const nl = {
  // App
  app_title: "Spotify Radio",
  app_subtitle: "Live Radio Experience",
  app_tagline: "Je Eigen Radiozender",
  app_description: "Luister naar je favoriete muziek met een echte radio-ervaring, compleet met DJ, weer en nieuws.",

  // Connection
  connecting: "Verbinden met Spotify...",
  connecting_description: "Je Spotify Premium account wordt nu gekoppeld aan de radio player.",
  loading: "Even geduld...",

  // Player controls
  play: "Afspelen",
  pause: "Pauzeren",
  skip: "Volgend nummer",
  select_station: "Selecteer een zender om te beginnen",

  // Now playing
  now_playing: "Nu aan het spelen",
  dj_speaking: "DJ aan het woord",

  // Weather
  weather_loading: "Weer laden...",
  weather_not_available: "Weer niet beschikbaar",
  weather_feels_like: "Voelt als",
  weather_humidity: "Vocht",
  weather_wind: "Wind",
  weather_location: "Locatie",
  weather_advice_cold: "Trek je warme jas aan!",
  weather_advice_hot: "Vergeet je zonnebrand niet!",
  weather_advice_rain: "Neem een paraplu mee!",
  weather_advice_nice: "Geniet van het weer!",

  // News
  news: "Nieuws",
  news_loading: "Nieuws wordt geladen...",
  news_latest: "Laatste Nieuws",
  news_read_more: "Lees meer",
  news_close: "Sluiten",

  // Share
  share: "Delen",
  share_as_text: "Deel als tekst",
  share_as_image: "Deel als afbeelding",
  share_preset: "Deel station preset",
  share_generating: "Genereren...",
  share_link_copied: "Link gekopieerd!",
  share_preset_copied: "Preset link gekopieerd!",
  share_image_saved: "Afbeelding opgeslagen!",
  share_image_error: "Fout bij maken afbeelding",
  share_text_template: "Ik luister naar {track} van {artist} op {station}!",

  // Sleep timer
  sleep_timer: "Slaaptimer",

  // Song history
  history: "Geschiedenis",

  // Listeners
  listeners: "luisteraars",

  // Theme
  theme_neon: "Neon",
  theme_retro: "Retro",
  theme_minimal: "Minimal",

  // Favorites
  add_favorite: "Toevoegen aan favorieten",
  remove_favorite: "Verwijderen uit favorieten",

  // Time of day
  morning: "ochtend",
  afternoon: "middag",
  evening: "avond",
  night: "nacht",

  // DJ greetings
  greeting_morning: "Goedemorgen",
  greeting_afternoon: "Goedemiddag",
  greeting_evening: "Goedenavond",
  greeting_night: "Goedenacht",
} as const;

export type TranslationKey = keyof typeof nl;
