// ═══════════════════════════════════════════════════════════════
//  STATION CONFIGURATION — Single source of truth for all stations
// ═══════════════════════════════════════════════════════════════

import type { DJVoice } from "@/types";

// ── Station IDs ─────────────────────────────────────────────

export type StationId =
  | "pop"
  | "rock"
  | "rnb"
  | "jazz"
  | "hiphop"
  | "dutch"
  | "classics"
  | "indie"
  | "dance"
  | "chill";

// ── Time of Day ─────────────────────────────────────────────

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  return "night";
}

// ── DJ Tone ─────────────────────────────────────────────────

export type DJTone = "chill" | "energetic" | "warm" | "smooth" | "edgy";

// ── Station Config Interface ────────────────────────────────

export interface StationShow {
  name: string;
  tagline: string;
}

export interface DJProfile {
  name: string;
  voice: DJVoice;
  tone: DJTone;
  talkativeness: number; // 0.3–1.0 — affects announcement frequency
  interjections: string[];
  rate: string;  // TTS rate e.g. "+5%", "-10%", "default"
  pitch: string; // TTS pitch e.g. "+2Hz", "-3Hz", "default"
}

export interface RotationWeights {
  current: number;  // Recent hits (last 2yr)
  recurrent: number; // Established tracks (2–8yr)
  gold: number;      // Classics (8yr+)
}

export interface StationConfig {
  id: StationId;
  label: string;
  frequency: string;
  tagline: string;
  color: string;
  colorSecondary: string;
  icon: string;
  searchTerms: string[];
  seedGenres: string[];  // Spotify-recognized genre seeds for Recommendations API
  yearRange: { min: number; max: number };
  popularityRange: { min: number; max: number };
  rotationWeights: RotationWeights;
  djProfile: DJProfile;
  shows: Record<TimeOfDay, StationShow>;
  segmentWeights: {
    weather: number;
    news: number;
    fun_fact: number;
    station_id: number;
    song_intro: number;
    jingle: number;
    time: number;
  };
}

// ── The 10 Stations ─────────────────────────────────────────

const currentYear = new Date().getFullYear();

export const STATIONS: StationConfig[] = [
  {
    id: "pop",
    label: "Pop FM",
    frequency: "89.5",
    tagline: "De beste hits van nu!",
    color: "#ff6b35",
    colorSecondary: "#ff9a6c",
    icon: "🎵",
    searchTerms: [
      "pop", "top hits", "chart hits", "dance pop", "synth pop", "electro pop",
      "Dua Lipa", "The Weeknd", "Billie Eilish", "Harry Styles",
      "Taylor Swift", "Olivia Rodrigo", "Sabrina Carpenter", "Ariana Grande",
      "Ed Sheeran", "Bruno Mars", "Rihanna", "Justin Bieber",
      "Doja Cat", "SZA", "Tate McRae", "Chappell Roan",
    ],
    seedGenres: ["pop", "dance pop", "electropop"],
    yearRange: { min: 2018, max: currentYear },
    popularityRange: { min: 55, max: 100 },
    rotationWeights: { current: 0.5, recurrent: 0.3, gold: 0.2 },
    djProfile: {
      name: "DJ Fenna",
      voice: "nl-NL-FennaNeural",
      tone: "energetic",
      talkativeness: 0.7,
      interjections: ["Wow!", "Jaaa!", "Lekker hoor!", "Bam!", "Wat een hit!", "Top!"],
      rate: "+5%",
      pitch: "default",
    },
    shows: {
      morning: { name: "De Ochtend Show", tagline: "Wakker worden met de beste hits!" },
      afternoon: { name: "Middag Mix", tagline: "Non-stop hits voor je middag" },
      evening: { name: "Drive Time", tagline: "De lekkerste hits op weg naar huis" },
      night: { name: "Night Vibes", tagline: "Chill hits voor de avond" },
    },
    segmentWeights: { weather: 0.2, news: 0.2, fun_fact: 0.15, station_id: 0.15, song_intro: 0.15, jingle: 0.1, time: 0.05 },
  },
  {
    id: "rock",
    label: "Rock FM",
    frequency: "92.3",
    tagline: "Louder than life!",
    color: "#ef4444",
    colorSecondary: "#f87171",
    icon: "🎸",
    searchTerms: [
      "rock", "alternative rock", "indie rock", "classic rock", "hard rock",
      "grunge", "post punk", "garage rock",
      "Foo Fighters", "Arctic Monkeys", "Red Hot Chili Peppers", "Nirvana",
      "Queens of the Stone Age", "The Black Keys", "Muse", "Green Day",
      "Pearl Jam", "Radiohead", "The Killers", "Imagine Dragons",
      "Royal Blood", "Nothing But Thieves", "Greta Van Fleet",
    ],
    seedGenres: ["rock", "alternative rock", "hard rock"],
    yearRange: { min: 1990, max: currentYear },
    popularityRange: { min: 40, max: 100 },
    rotationWeights: { current: 0.3, recurrent: 0.3, gold: 0.4 },
    djProfile: {
      name: "DJ Maarten",
      voice: "nl-NL-MaartenNeural",
      tone: "edgy",
      talkativeness: 0.5,
      interjections: ["Vet!", "Lekker rauw!", "Daar gaat ie!", "Rock on!", "Beuken!"],
      rate: "default",
      pitch: "-2Hz",
    },
    shows: {
      morning: { name: "Morning Rock", tagline: "Begin je dag met power" },
      afternoon: { name: "Rock Classics", tagline: "De beste rock aller tijden" },
      evening: { name: "Rock Drive", tagline: "Vol gas naar huis" },
      night: { name: "Late Night Rock", tagline: "Rauwe rock voor de nacht" },
    },
    segmentWeights: { weather: 0.1, news: 0.1, fun_fact: 0.2, station_id: 0.2, song_intro: 0.2, jingle: 0.15, time: 0.05 },
  },
  {
    id: "rnb",
    label: "R&B FM",
    frequency: "95.1",
    tagline: "Smooth vibes, real soul",
    color: "#8b5cf6",
    colorSecondary: "#a78bfa",
    icon: "🎤",
    searchTerms: [
      "r&b", "soul", "rnb", "neo soul", "contemporary r&b", "urban",
      "Beyoncé", "Frank Ocean", "The Weeknd", "Usher", "Alicia Keys",
      "H.E.R.", "Daniel Caesar", "Summer Walker", "Jhené Aiko",
      "Chris Brown", "Khalid", "Jorja Smith", "Brent Faiyaz",
      "SZA", "Tyla", "Victoria Monét",
    ],
    seedGenres: ["r-n-b", "soul", "neo soul"],
    yearRange: { min: 2000, max: currentYear },
    popularityRange: { min: 45, max: 100 },
    rotationWeights: { current: 0.4, recurrent: 0.35, gold: 0.25 },
    djProfile: {
      name: "DJ Colette",
      voice: "nl-NL-ColetteNeural",
      tone: "smooth",
      talkativeness: 0.6,
      interjections: ["Heerlijk...", "Wat smooth...", "Geniet ervan...", "Prachtig..."],
      rate: "-5%",
      pitch: "default",
    },
    shows: {
      morning: { name: "Morning Soul", tagline: "Zacht wakker worden met soul" },
      afternoon: { name: "Afternoon Vibes", tagline: "Smooth door de middag" },
      evening: { name: "Evening R&B", tagline: "De beste R&B voor de avond" },
      night: { name: "Midnight Soul", tagline: "Late night soul sessie" },
    },
    segmentWeights: { weather: 0.15, news: 0.15, fun_fact: 0.15, station_id: 0.15, song_intro: 0.2, jingle: 0.1, time: 0.1 },
  },
  {
    id: "jazz",
    label: "Jazz FM",
    frequency: "97.8",
    tagline: "Timeless jazz, endless soul",
    color: "#fbbf24",
    colorSecondary: "#fcd34d",
    icon: "🎷",
    searchTerms: [
      "jazz", "smooth jazz", "jazz piano", "jazz vocal", "bossa nova",
      "cool jazz", "bebop", "jazz fusion", "latin jazz",
      "Miles Davis", "John Coltrane", "Bill Evans", "Chet Baker",
      "Nina Simone", "Norah Jones", "Gregory Porter", "Kamasi Washington",
      "Robert Glasper", "Herbie Hancock", "Thelonious Monk",
      "Diana Krall", "Jamie Cullum", "Esperanza Spalding",
    ],
    seedGenres: ["jazz", "smooth jazz", "vocal jazz"],
    yearRange: { min: 1955, max: currentYear },
    popularityRange: { min: 25, max: 100 },
    rotationWeights: { current: 0.2, recurrent: 0.3, gold: 0.5 },
    djProfile: {
      name: "DJ Maarten",
      voice: "nl-NL-MaartenNeural",
      tone: "smooth",
      talkativeness: 0.4,
      interjections: ["Prachtig...", "Wat een klasse...", "Tijdloos...", "Heerlijk..."],
      rate: "-10%",
      pitch: "-3Hz",
    },
    shows: {
      morning: { name: "Morning Jazz", tagline: "Jazz bij je koffie" },
      afternoon: { name: "Afternoon Jazz", tagline: "Ontspannen jazz voor de middag" },
      evening: { name: "Jazz Lounge", tagline: "Sophisticated sounds" },
      night: { name: "Late Night Jazz", tagline: "Jazz in het donker" },
    },
    segmentWeights: { weather: 0.1, news: 0.05, fun_fact: 0.25, station_id: 0.1, song_intro: 0.3, jingle: 0.1, time: 0.1 },
  },
  {
    id: "hiphop",
    label: "Hip-Hop FM",
    frequency: "101.3",
    tagline: "De hardste beats!",
    color: "#22c55e",
    colorSecondary: "#4ade80",
    icon: "🎧",
    searchTerms: [
      "hip hop", "rap", "trap", "drill", "boom bap", "conscious hip hop",
      "Kendrick Lamar", "Drake", "Travis Scott", "J. Cole", "Tyler the Creator",
      "Kanye West", "Jay-Z", "Eminem", "A$AP Rocky",
      "21 Savage", "Metro Boomin", "Future", "Lil Baby",
      "JID", "Denzel Curry", "Baby Keem",
    ],
    seedGenres: ["hip-hop", "rap", "trap"],
    yearRange: { min: 2010, max: currentYear },
    popularityRange: { min: 50, max: 100 },
    rotationWeights: { current: 0.5, recurrent: 0.3, gold: 0.2 },
    djProfile: {
      name: "DJ Maarten",
      voice: "nl-NL-MaartenNeural",
      tone: "edgy",
      talkativeness: 0.6,
      interjections: ["Fire!", "Dikke beat!", "Hard!", "Banger!", "Vet nummer!"],
      rate: "+3%",
      pitch: "default",
    },
    shows: {
      morning: { name: "Wake Up Call", tagline: "Bars in de ochtend" },
      afternoon: { name: "The Block", tagline: "Non-stop hip-hop" },
      evening: { name: "Rush Hour", tagline: "De hardste beats van de dag" },
      night: { name: "After Hours", tagline: "Late night bars" },
    },
    segmentWeights: { weather: 0.1, news: 0.15, fun_fact: 0.15, station_id: 0.2, song_intro: 0.15, jingle: 0.2, time: 0.05 },
  },
  {
    id: "dutch",
    label: "NL Hits",
    frequency: "104.7",
    tagline: "Het beste van Nederland!",
    color: "#4a9eff",
    colorSecondary: "#7ab8ff",
    icon: "🇳🇱",
    searchTerms: [
      "Nederlandse muziek", "Dutch pop", "Nederlandstalig",
      "Marco Borsato", "Andre Hazes", "Guus Meeuwis", "BLØF",
      "Nielson", "Suzan & Freek", "Davina Michelle", "Snelle",
      "Flemming", "Maan", "Tino Martin", "Nick & Simon",
      "Anouk", "Ilse DeLange", "Acda en de Munnik", "Het Goede Doel",
      "Doe Maar", "Golden Earring", "Volumia", "De Dijk",
    ],
    seedGenres: ["dutch pop", "dutch rock", "nederpop"],
    yearRange: { min: 1985, max: currentYear },
    popularityRange: { min: 20, max: 100 },
    rotationWeights: { current: 0.35, recurrent: 0.3, gold: 0.35 },
    djProfile: {
      name: "DJ Fenna",
      voice: "nl-NL-FennaNeural",
      tone: "warm",
      talkativeness: 0.7,
      interjections: ["Prachtig!", "Genieten!", "Mooi nummer!", "Hollands glorie!", "Fantastisch!"],
      rate: "default",
      pitch: "default",
    },
    shows: {
      morning: { name: "Goedemorgen Nederland", tagline: "Wakker worden met Hollandse hits" },
      afternoon: { name: "Hollandse Middag", tagline: "De gezelligste hits van NL" },
      evening: { name: "Hollandse Avond", tagline: "Nederlandse toppers" },
      night: { name: "Stille Nacht", tagline: "Rustige Nederlandse muziek" },
    },
    segmentWeights: { weather: 0.2, news: 0.2, fun_fact: 0.2, station_id: 0.1, song_intro: 0.15, jingle: 0.1, time: 0.05 },
  },
  // ═══ NEW STATIONS ═══
  {
    id: "classics",
    label: "NL Klassiekers",
    frequency: "87.2",
    tagline: "Tijdloze Nederlandse klassiekers",
    color: "#d97706",
    colorSecondary: "#f59e0b",
    icon: "📻",
    searchTerms: [
      "Nederlandse klassiekers", "Dutch classics", "Nederlandstalige hits",
      "Andre Hazes", "Marco Borsato", "Rob de Nijs", "Boudewijn de Groot",
      "Herman Brood", "Golden Earring", "Doe Maar", "Het Goede Doel",
      "Toontje Lansen", "Ramses Shaffy", "Liesbeth List", "Frans Bauer",
      "De Dijk", "Frank Boeijen", "Acda en de Munnik", "Normaal",
      "Klein Orkest", "Volumia", "Jan Smit", "Lee Towers",
    ],
    seedGenres: ["dutch pop", "dutch rock", "levenslied"],
    yearRange: { min: 1970, max: 2005 },
    popularityRange: { min: 10, max: 100 },
    rotationWeights: { current: 0.0, recurrent: 0.2, gold: 0.8 },
    djProfile: {
      name: "DJ Colette",
      voice: "nl-NL-ColetteNeural",
      tone: "warm",
      talkativeness: 0.6,
      interjections: ["Tijdloos!", "Wat een klassieker!", "Genieten!", "Herinner je dit nog?", "Prachtig!"],
      rate: "-5%",
      pitch: "default",
    },
    shows: {
      morning: { name: "Ochtend Klassiekers", tagline: "Goedemorgen met goud" },
      afternoon: { name: "Gouden Middagen", tagline: "De mooiste klassiekers" },
      evening: { name: "Evergreen Express", tagline: "Herinneringen aan vroeger" },
      night: { name: "Nacht van de Klassieker", tagline: "Stille nacht, gouden platen" },
    },
    segmentWeights: { weather: 0.15, news: 0.1, fun_fact: 0.25, station_id: 0.1, song_intro: 0.25, jingle: 0.1, time: 0.05 },
  },
  {
    id: "indie",
    label: "Indie FM",
    frequency: "99.0",
    tagline: "Discover the underground",
    color: "#ec4899",
    colorSecondary: "#f472b6",
    icon: "🌿",
    searchTerms: [
      "indie", "indie pop", "indie rock", "indie folk", "dream pop",
      "shoegaze", "bedroom pop", "art pop", "lo-fi indie",
      "Tame Impala", "Mac DeMarco", "Phoebe Bridgers", "Bon Iver",
      "Clairo", "beabadoobee", "Alvvays", "Mitski",
      "Men I Trust", "Wallows", "The 1975", "Hozier",
      "Cage the Elephant", "Vampire Weekend", "Glass Animals",
    ],
    seedGenres: ["indie pop", "indie rock", "dream pop"],
    yearRange: { min: 2010, max: currentYear },
    popularityRange: { min: 30, max: 90 },
    rotationWeights: { current: 0.45, recurrent: 0.35, gold: 0.2 },
    djProfile: {
      name: "DJ Fenna",
      voice: "nl-NL-FennaNeural",
      tone: "chill",
      talkativeness: 0.5,
      interjections: ["Mooi...", "Ontdekking!", "Luister...", "Bijzonder...", "Fijn nummer..."],
      rate: "-3%",
      pitch: "default",
    },
    shows: {
      morning: { name: "Morning Discovery", tagline: "Nieuwe sounds voor je ochtend" },
      afternoon: { name: "Indie Mix", tagline: "Het beste van indie" },
      evening: { name: "Sunset Sessions", tagline: "Indie voor de schemering" },
      night: { name: "Midnight Indie", tagline: "Stille ontdekkingen" },
    },
    segmentWeights: { weather: 0.1, news: 0.1, fun_fact: 0.2, station_id: 0.15, song_intro: 0.25, jingle: 0.1, time: 0.1 },
  },
  {
    id: "dance",
    label: "Dance FM",
    frequency: "106.5",
    tagline: "Non-stop dance energy!",
    color: "#06b6d4",
    colorSecondary: "#22d3ee",
    icon: "🪩",
    searchTerms: [
      "dance", "electronic", "EDM", "house", "deep house", "tech house",
      "tropical house", "progressive house", "trance", "drum and bass",
      "Martin Garrix", "Tiësto", "Armin van Buuren", "Afrojack",
      "David Guetta", "Calvin Harris", "Kygo", "Marshmello",
      "Hardwell", "Oliver Heldens", "Sam Feldt", "Lost Frequencies",
      "Nicky Romero", "Don Diablo", "Fedde Le Grand",
    ],
    seedGenres: ["edm", "house", "progressive house"],
    yearRange: { min: 2015, max: currentYear },
    popularityRange: { min: 45, max: 100 },
    rotationWeights: { current: 0.55, recurrent: 0.3, gold: 0.15 },
    djProfile: {
      name: "DJ Maarten",
      voice: "nl-NL-MaartenNeural",
      tone: "energetic",
      talkativeness: 0.5,
      interjections: ["Let's go!", "Banger!", "Drop!", "Hands up!", "Gaan!", "Party!"],
      rate: "+8%",
      pitch: "+2Hz",
    },
    shows: {
      morning: { name: "Morning Energy", tagline: "Wakker worden met beats" },
      afternoon: { name: "Afternoon Club", tagline: "Non-stop dance hits" },
      evening: { name: "Pre-Party", tagline: "Warm-up voor de avond" },
      night: { name: "Nachtclub", tagline: "De nacht is van ons" },
    },
    segmentWeights: { weather: 0.05, news: 0.05, fun_fact: 0.1, station_id: 0.25, song_intro: 0.1, jingle: 0.35, time: 0.1 },
  },
  {
    id: "chill",
    label: "Chill Lounge",
    frequency: "108.0",
    tagline: "Relax, unwind, enjoy",
    color: "#14b8a6",
    colorSecondary: "#5eead4",
    icon: "🌊",
    searchTerms: [
      "chill", "lounge", "ambient pop", "chillout", "downtempo",
      "trip hop", "lo-fi", "soft pop", "acoustic chill",
      "Khruangbin", "FKJ", "Tom Misch", "Jordan Rakei",
      "Bonobo", "Tycho", "Norah Jones", "Jack Johnson",
      "Ben Howard", "José González", "Mazzy Star",
      "Zero 7", "Air", "Massive Attack", "Nightmares on Wax",
    ],
    seedGenres: ["chill", "ambient", "trip-hop"],
    yearRange: { min: 2000, max: currentYear },
    popularityRange: { min: 20, max: 85 },
    rotationWeights: { current: 0.3, recurrent: 0.35, gold: 0.35 },
    djProfile: {
      name: "DJ Colette",
      voice: "nl-NL-ColetteNeural",
      tone: "chill",
      talkativeness: 0.35,
      interjections: ["Heerlijk relaxt...", "Rustig aan...", "Geniet...", "Mm...", "Zen..."],
      rate: "-10%",
      pitch: "-2Hz",
    },
    shows: {
      morning: { name: "Slow Morning", tagline: "Rustig de dag beginnen" },
      afternoon: { name: "Afternoon Zen", tagline: "Ontspanning midden op de dag" },
      evening: { name: "Sunset Chill", tagline: "Zonsondergang sessie" },
      night: { name: "Deep Night", tagline: "Stille uren, zachte klanken" },
    },
    segmentWeights: { weather: 0.2, news: 0.05, fun_fact: 0.15, station_id: 0.1, song_intro: 0.25, jingle: 0.05, time: 0.2 },
  },
];

// ── Helper functions ────────────────────────────────────────

export function getStation(id: StationId): StationConfig {
  return STATIONS.find((s) => s.id === id) || STATIONS[0];
}

export function getStationColor(stationId: string): string {
  if (typeof window !== "undefined") {
    try {
      const customColors = JSON.parse(localStorage.getItem("sr_custom_colors") || "{}");
      if (customColors[stationId]) {
        return customColors[stationId];
      }
    } catch (e) {
      // fallback to default if parsing fails
    }
  }

  const s = STATIONS.find(
    (st) =>
      st.id === stationId.toLowerCase() ||
      st.label.toLowerCase() === stationId.toLowerCase()
  );
  return s?.color || "#b3b3b3";
}

export function getCurrentShow(station: StationConfig): StationShow {
  return station.shows[getTimeOfDay()];
}

// ── Legacy compatibility ────────────────────────────────────
// Components that used GENRES can import STATIONS instead.
// The shape is a superset of the old GenreConfig.
