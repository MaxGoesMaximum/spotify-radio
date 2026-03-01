// ═══════════════════════════════════════════════════════════════
//  ENGLISH STRINGS — UI text translations
// ═══════════════════════════════════════════════════════════════

import type { TranslationKey } from "./nl";

export const en: Record<TranslationKey, string> = {
  // App
  app_title: "Spotify Radio",
  app_subtitle: "Live Radio Experience",
  app_tagline: "Your Own Radio Station",
  app_description: "Listen to your favorite music with a real radio experience, complete with DJ, weather, and news.",

  // Connection
  connecting: "Connecting to Spotify...",
  connecting_description: "Your Spotify Premium account is being linked to the radio player.",
  loading: "Please wait...",

  // Player controls
  play: "Play",
  pause: "Pause",
  skip: "Next track",
  select_station: "Select a station to start",

  // Now playing
  now_playing: "Now Playing",
  dj_speaking: "DJ speaking",

  // Weather
  weather_loading: "Loading weather...",
  weather_not_available: "Weather not available",
  weather_feels_like: "Feels like",
  weather_humidity: "Humidity",
  weather_wind: "Wind",
  weather_location: "Location",
  weather_advice_cold: "Don't forget your warm jacket!",
  weather_advice_hot: "Don't forget your sunscreen!",
  weather_advice_rain: "Take an umbrella with you!",
  weather_advice_nice: "Enjoy the weather!",

  // News
  news: "News",
  news_loading: "Loading news...",
  news_latest: "Latest News",
  news_read_more: "Read more",
  news_close: "Close",

  // Share
  share: "Share",
  share_as_text: "Share as text",
  share_as_image: "Share as image",
  share_preset: "Share station preset",
  share_generating: "Generating...",
  share_link_copied: "Link copied!",
  share_preset_copied: "Preset link copied!",
  share_image_saved: "Image saved!",
  share_image_error: "Error creating image",
  share_text_template: "I'm listening to {track} by {artist} on {station}!",

  // Sleep timer
  sleep_timer: "Sleep Timer",

  // Song history
  history: "History",

  // Listeners
  listeners: "listeners",

  // Theme
  theme_neon: "Neon",
  theme_retro: "Retro",
  theme_minimal: "Minimal",

  // Favorites
  add_favorite: "Add to favorites",
  remove_favorite: "Remove from favorites",

  // Time of day
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",

  // DJ greetings
  greeting_morning: "Good morning",
  greeting_afternoon: "Good afternoon",
  greeting_evening: "Good evening",
  greeting_night: "Good night",
};
