// ═══════════════════════════════════════════════════════════════
//  DJ REQUEST PARSER — Keyword-based Dutch request parser
//  Converts user input into structured DJRequest objects
// ═══════════════════════════════════════════════════════════════

export interface DJRequest {
  type: "decade" | "genre" | "mood" | "artist" | "mixed";
  label: string; // Human-readable label for display
  // Filters to apply to music selector
  yearRange?: { min: number; max: number };
  genreBoost?: string[];
  energyRange?: { min: number; max: number };
  artistSearch?: string;
  expiresAfterTracks: number; // Auto-clear after N tracks
}

// ── Decade keywords ─────────────────────────────────────────

const DECADE_PATTERNS: { pattern: RegExp; min: number; max: number; label: string }[] = [
  { pattern: /jaren\s*60|60s|sixties|zestig/i, min: 1960, max: 1969, label: "Jaren 60" },
  { pattern: /jaren\s*70|70s|seventies|zeventig/i, min: 1970, max: 1979, label: "Jaren 70" },
  { pattern: /jaren\s*80|80s|eighties|tachtig/i, min: 1980, max: 1989, label: "Jaren 80" },
  { pattern: /jaren\s*90|90s|nineties|negentig/i, min: 1990, max: 1999, label: "Jaren 90" },
  { pattern: /jaren\s*00|00s|nul|2000/i, min: 2000, max: 2009, label: "Jaren 00" },
  { pattern: /jaren\s*10|10s|tien|2010/i, min: 2010, max: 2019, label: "Jaren 10" },
  { pattern: /jaren\s*20|20s|twintig|2020/i, min: 2020, max: 2029, label: "Jaren 20" },
];

// ── Genre keywords ──────────────────────────────────────────

const GENRE_PATTERNS: { pattern: RegExp; genres: string[]; label: string }[] = [
  { pattern: /\brock\b/i, genres: ["rock", "alternative rock", "classic rock"], label: "Rock" },
  { pattern: /\bjazz\b/i, genres: ["jazz", "smooth jazz", "jazz fusion"], label: "Jazz" },
  { pattern: /\bpop\b/i, genres: ["pop", "synth-pop", "indie pop"], label: "Pop" },
  { pattern: /\bhip\s*hop\b|\brap\b/i, genres: ["hip hop", "rap", "trap"], label: "Hip-Hop" },
  { pattern: /\bdance\b|\bedm\b|\belectro/i, genres: ["dance", "edm", "electronic", "house"], label: "Dance" },
  { pattern: /\bhouse\b/i, genres: ["house", "deep house", "tech house"], label: "House" },
  { pattern: /\bklassiek\b|\bclassic/i, genres: ["classical", "orchestral"], label: "Klassiek" },
  { pattern: /\bsoul\b|\br&b\b|\brnb\b/i, genres: ["soul", "r&b", "neo soul"], label: "Soul/R&B" },
  { pattern: /\breggae\b/i, genres: ["reggae", "dancehall"], label: "Reggae" },
  { pattern: /\bcountry\b/i, genres: ["country", "americana"], label: "Country" },
  { pattern: /\bmetal\b|\bheavy\b/i, genres: ["metal", "heavy metal", "metalcore"], label: "Metal" },
  { pattern: /\bpunk\b/i, genres: ["punk", "punk rock", "pop punk"], label: "Punk" },
  { pattern: /\bindie\b/i, genres: ["indie", "indie rock", "indie pop"], label: "Indie" },
  { pattern: /\bfunk\b/i, genres: ["funk", "disco funk"], label: "Funk" },
  { pattern: /\bblues\b/i, genres: ["blues", "electric blues"], label: "Blues" },
  { pattern: /\blatin\b|\bsalsa\b|\breggaeton/i, genres: ["latin", "reggaeton", "salsa"], label: "Latin" },
  { pattern: /\bnederlands\b|\bhollands\b|\bnl\b/i, genres: ["dutch pop", "nederlandstalig", "levenslied"], label: "Nederlands" },
];

// ── Mood keywords ───────────────────────────────────────────

const MOOD_PATTERNS: { pattern: RegExp; energy: { min: number; max: number }; label: string }[] = [
  { pattern: /\brustig\b|\bcalm\b|\brelax\b|\bchill\b|\bontspannen/i, energy: { min: 0, max: 0.4 }, label: "Rustige muziek" },
  { pattern: /\bslapen\b|\bslaap\b|\bsleep/i, energy: { min: 0, max: 0.3 }, label: "Slaapliedjes" },
  { pattern: /\bfeest\b|\bparty\b|\bknallen\b|\bharden/i, energy: { min: 0.7, max: 1.0 }, label: "Feestmuziek" },
  { pattern: /\benergiek\b|\benergie\b|\bupbeat\b|\bvrolijk/i, energy: { min: 0.6, max: 1.0 }, label: "Energieke muziek" },
  { pattern: /\bromantisch\b|\bliefde\b|\blove\b|\bromantic/i, energy: { min: 0.2, max: 0.6 }, label: "Romantische muziek" },
  { pattern: /\bverdrietig\b|\bsad\b|\bmelancholisch/i, energy: { min: 0.1, max: 0.4 }, label: "Melancholische muziek" },
  { pattern: /\bfocus\b|\bstuderen\b|\bwerk\b|\bconcentr/i, energy: { min: 0.2, max: 0.5 }, label: "Focus muziek" },
  { pattern: /\bsport\b|\bworkout\b|\bgym\b|\bhardlopen/i, energy: { min: 0.8, max: 1.0 }, label: "Workout muziek" },
];

// ── Main parser ─────────────────────────────────────────────

export function parseDJRequest(input: string): DJRequest | null {
  const text = input.trim().toLowerCase();
  if (!text || text.length < 2) return null;

  let request: Partial<DJRequest> = {
    expiresAfterTracks: 5,
  };

  const labels: string[] = [];
  let hasMatch = false;

  // Check decades
  for (const dec of DECADE_PATTERNS) {
    if (dec.pattern.test(text)) {
      request.yearRange = { min: dec.min, max: dec.max };
      labels.push(dec.label);
      hasMatch = true;
      break;
    }
  }

  // Check genres
  for (const gen of GENRE_PATTERNS) {
    if (gen.pattern.test(text)) {
      request.genreBoost = gen.genres;
      labels.push(gen.label);
      hasMatch = true;
      break;
    }
  }

  // Check moods
  for (const mood of MOOD_PATTERNS) {
    if (mood.pattern.test(text)) {
      request.energyRange = mood.energy;
      labels.push(mood.label);
      hasMatch = true;
      break;
    }
  }

  // Check for "iets nieuws" / "nieuw" / "ontdek" → discovery boost
  if (/\bnieuw\b|\bontdek\b|\bonbekend\b|\bverras/i.test(text)) {
    // Set low popularity to discover new artists
    request.energyRange = request.energyRange || { min: 0, max: 1.0 };
    labels.push("Nieuwe ontdekkingen");
    hasMatch = true;
  }

  // Check for "meer van [artist]" pattern
  const artistMatch = text.match(/(?:meer\s+(?:van\s+)?|draai\s+(?:eens\s+)?|speel\s+(?:eens\s+)?)(.+)/i);
  if (artistMatch && !hasMatch) {
    const possibleArtist = artistMatch[1].trim();
    // Only treat as artist if it doesn't match genre/mood/decade
    if (possibleArtist.length > 1) {
      request.artistSearch = possibleArtist;
      labels.push(possibleArtist);
      hasMatch = true;
    }
  }

  if (!hasMatch) return null;

  // Determine type
  let type: DJRequest["type"] = "mixed";
  if (request.yearRange && !request.genreBoost && !request.energyRange) type = "decade";
  else if (request.genreBoost && !request.yearRange && !request.energyRange) type = "genre";
  else if (request.energyRange && !request.yearRange && !request.genreBoost) type = "mood";
  else if (request.artistSearch) type = "artist";

  return {
    type,
    label: labels.join(" + "),
    yearRange: request.yearRange,
    genreBoost: request.genreBoost,
    energyRange: request.energyRange,
    artistSearch: request.artistSearch,
    expiresAfterTracks: request.expiresAfterTracks!,
  };
}

// ── Quick-action chip presets ───────────────────────────────

export interface QuickChip {
  label: string;
  icon: string;
  query: string;
}

export const QUICK_CHIPS: QuickChip[] = [
  { label: "Jaren 80", icon: "🕺", query: "jaren 80" },
  { label: "Meer rock", icon: "🎸", query: "rock" },
  { label: "Rustig", icon: "😌", query: "rustige muziek" },
  { label: "Feest!", icon: "🎉", query: "feestmuziek" },
  { label: "Iets nieuws", icon: "✨", query: "iets nieuws" },
  { label: "Focus", icon: "🎯", query: "focus muziek" },
];
