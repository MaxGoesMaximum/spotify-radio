// ═══════════════════════════════════════════════════════════════
//  SCRIPT GENERATOR — Per-station, tone-aware DJ scripts
// ═══════════════════════════════════════════════════════════════

import type { SpotifyTrack, WeatherData, NewsArticle } from "@/types";
import { getStation, getCurrentShow, type StationId, type DJTone } from "@/config/stations";
import { getDJName, getInterjection } from "./voice-mapper";
import { getHolidayDJLine } from "./holidays";
import { getGreeting } from "@/lib/utils";
import type { ScriptType } from "@/services/dj-scripts";

// ── Tone-specific phrase banks ──────────────────────────────

type PhraseBankKey = "filler" | "transition" | "stationId" | "funFact";

const TONE_PHRASES: Record<DJTone, Record<PhraseBankKey, string[]>> = {
  energetic: {
    filler: [
      "Wow, wat een nummer!", "Bam! Daar ging ie!", "Jaaa, lekker hoor!",
      "Wauw!", "Top nummer dit!", "Vol gas!", "Daar word je blij van!",
      "We gaan lekker door!", "Banger!", "Dit is waar het om draait!",
    ],
    transition: [
      "En we gaan volle kracht verder met", "Het volgende nummer, gaan!",
      "Hier komt ie!", "Nog een dikke plaat, van",
      "Non-stop hits, hier is", "Party time met",
      "We draaien door met", "Speciaal voor jullie,",
    ],
    stationId: [
      "Je luistert naar {station}, non-stop de beste hits!",
      "{station}! De muziek die je energie geeft!",
      "Dit is {station}, wij stoppen nooit!",
      "{station}, nummer 1 voor de beste beats!",
    ],
    funFact: [
      "Even een leuk feitje tussendoor!", "Check dit even!",
      "Weetje van de dag!", "Interessant feitje!",
    ],
  },
  chill: {
    filler: [
      "Mooi... echt mooi.", "Heerlijk om naar te luisteren.",
      "Geniet ervan...", "Rustig aan, genieten...",
      "Wat een fijn nummer...", "Mm, dit is goed...",
      "Ontspannen...", "Lekker rustig...",
    ],
    transition: [
      "En we gaan rustig verder met", "Het volgende nummer is van",
      "Luister nu naar", "Even lekker doorluisteren met",
      "Nog meer moois, van", "Rustig aan, hier is",
    ],
    stationId: [
      "Je luistert naar {station}... ontspannen en genieten.",
      "{station}. Muziek voor de ziel.",
      "Dit is {station}, rustig aan en genieten.",
      "{station}... relax en luister.",
    ],
    funFact: [
      "Even een rustig momentje voor een leuk feitje.", "Wist je dit al?",
      "Zomaar een feitje...", "Interessant...",
    ],
  },
  warm: {
    filler: [
      "Prachtig toch?", "Genieten!", "Fantastisch nummer!",
      "Altijd mooi om te horen!", "Geweldig!", "Ik krijg er kippenvel van!",
      "Daar word je toch blij van?", "Wat een mooi nummer was dat!",
    ],
    transition: [
      "En we gaan verder met", "Het volgende nummer is van",
      "Nu voor jullie", "En dan nu",
      "Speciaal voor jullie luisteraars", "We draaien nu",
      "Dit wordt ook weer een topper, hier is",
    ],
    stationId: [
      "Je luistert naar {station}, de muziek die bij jou past!",
      "{station}, jouw favoriete radiozender!",
      "Welkom bij {station}, wij draaien door!",
      "{station}, altijd de lekkerste muziek!",
    ],
    funFact: [
      "Wist je dit al? Even een leuk feitje!", "Even een weetje tussendoor!",
      "Hier heb je een leuk feitje!", "Aandacht, een leuk weetje!",
    ],
  },
  smooth: {
    filler: [
      "Heerlijk...", "Wat smooth...", "Geniet ervan...",
      "Prachtig nummer...", "Klasse...", "Dat was schitterend...",
      "Wat een kwaliteit...", "Tijdloos mooi...",
    ],
    transition: [
      "En nu, voor jullie", "Het volgende nummer,",
      "Luister naar dit prachtige nummer van", "Nog meer moois,",
      "We gaan door met", "Hier is", "Even genieten van",
    ],
    stationId: [
      "Je luistert naar {station}. Kwaliteit in muziek.",
      "{station}... voor de fijnproevers.",
      "Dit is {station}, muziek met klasse.",
      "{station}. Alleen het beste.",
    ],
    funFact: [
      "Even een mooi feitje.", "Wist je dit?",
      "Een stukje kennis tussendoor.", "Bijzonder feitje...",
    ],
  },
  edgy: {
    filler: [
      "Vet!", "Hard!", "Dikke plaat!", "Fire!",
      "Beuken!", "Lekker rauw!", "Daar gaat ie!",
      "Rock on!", "Banger alert!",
    ],
    transition: [
      "En we pakken door met", "Nog eentje, van",
      "Check dit, van", "Hard gaan met",
      "Next up,", "Hier komt ie, van", "Volume omhoog voor",
    ],
    stationId: [
      "{station}! De hardste beats!",
      "Je luistert naar {station}, recht uit de underground!",
      "Dit is {station}, harder dan hard!",
      "{station}! Wij gaan door tot het einde!",
    ],
    funFact: [
      "Even een vet feitje!", "Check dit!",
      "Random fact!", "Wist je dit?",
    ],
  },
};

// ── Genre-specific fun facts ────────────────────────────────

const GENRE_FUN_FACTS: Record<string, string[]> = {
  default: [
    "Wist je dat Nederland meer fietsen heeft dan inwoners? Zo'n 23 miljoen fietsen!",
    "Wist je dat de eerste radio-uitzending in Nederland plaatsvond in 1919?",
    "Wist je dat muziek luisteren stress tot 65 procent kan verminderen?",
    "Wist je dat het luisteren naar muziek dezelfde stofjes aanmaakt als chocolade eten?",
    "Wist je dat Amsterdam meer bruggen heeft dan Venetie?",
    "Wist je dat stroopwafels oorspronkelijk uit Gouda komen?",
    "Wist je dat Nederland de grootste bloemexporteur ter wereld is?",
    "Wist je dat het woord gezellig niet te vertalen is naar het Engels?",
  ],
  jazz: [
    "Wist je dat Miles Davis het album Kind of Blue in slechts twee sessies opnam?",
    "Wist je dat het woord jazz waarschijnlijk uit New Orleans komt?",
    "Wist je dat John Coltrane soms 12 uur per dag oefende op zijn saxofoon?",
    "Wist je dat jazz de enige muziekvorm is die echt in Amerika is ontstaan?",
    "Wist je dat de eerste jazzopname werd gemaakt in 1917?",
  ],
  rock: [
    "Wist je dat de eerste elektrische gitaar werd uitgevonden in 1931?",
    "Wist je dat Golden Earring met Radar Love een van de langste hits ooit had?",
    "Wist je dat Led Zeppelin nooit singles uitbracht in het Verenigd Koninkrijk?",
    "Wist je dat de langste rockconcert ooit 437 uur duurde?",
    "Wist je dat Jimi Hendrix zichzelf gitaar leerde spelen?",
  ],
  hiphop: [
    "Wist je dat hip-hop in 1973 begon op een feestje in de Bronx?",
    "Wist je dat Rapper's Delight van The Sugarhill Gang de eerste grote hip-hop hit was?",
    "Wist je dat DJ Kool Herc wordt beschouwd als de vader van hip-hop?",
    "Wist je dat beatboxing al sinds de jaren 80 bestaat?",
    "Wist je dat het woord rap eigenlijk staat voor Rhythm And Poetry?",
  ],
  dutch: [
    "Wist je dat Andre Hazes de bestverkochte Nederlandse artiest aller tijden is?",
    "Wist je dat het Eurovisie Songfestival voor het eerst in Nederland werd gehouden in 1958?",
    "Wist je dat Marco Borsato meer dan 5 miljoen albums heeft verkocht?",
    "Wist je dat BLØF het langst actieve popgroep van Nederland is?",
    "Wist je dat het Concertgebouw in Amsterdam een van de beste akoestieken ter wereld heeft?",
  ],
  dance: [
    "Wist je dat Nederland het land is van de grootste DJ's ter wereld?",
    "Wist je dat Tiesto de eerste DJ was die op de Olympische Spelen draaide?",
    "Wist je dat Amsterdam Dance Event het grootste dancefeest ter wereld is?",
    "Wist je dat Martin Garrix slechts 17 was toen Animals een wereldhit werd?",
    "Wist je dat de TR-808 drumcomputer het geluid van dance muziek definieerde?",
  ],
};

// ── Dutch humanization helpers ──────────────────────────────

const DUTCH_FILLERS = ["eh", "nou", "zeg", "ja", "tja"];
const DUTCH_DIMINUTIVES: Record<string, string> = {
  nummer: "nummertje",
  moment: "momentje",
  liedje: "liedje",
  pauze: "pauzeke",
};

/**
 * Add natural Dutch filler words and diminutives to make speech more human
 */
function humanize(text: string, tone: DJTone): string {
  // Only add fillers to warmer/chattier tones
  if (tone === "chill" || tone === "smooth") return text;

  // Occasionally insert a filler word after a period
  const sentences = text.split(". ");
  const result = sentences.map((s, i) => {
    if (i > 0 && Math.random() < 0.2) {
      const filler = DUTCH_FILLERS[Math.floor(Math.random() * DUTCH_FILLERS.length)];
      return `${filler.charAt(0).toUpperCase() + filler.slice(1)}, ${s.charAt(0).toLowerCase() + s.slice(1)}`;
    }
    return s;
  });

  return result.join(". ");
}

// ── Core helpers ────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTimeString(): string {
  return new Date().toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeOfDayKey(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

const TIME_ADVICE: Record<string, string[]> = {
  morning: ["Een mooie start van de dag!", "Geniet van je ochtend!", "Nog even doorzetten naar de lunch!"],
  afternoon: ["De middag is al weer begonnen!", "Lekker doorwerken met goede muziek!", "De middag vliegt voorbij!"],
  evening: ["Geniet van je avond!", "Lekker relaxen met muziek!", "De avond is van jou!"],
  night: ["Nog even wakker? Geniet van de muziek!", "Nachtbrakers, deze is voor jullie!", "De nacht is nog jong!"],
};

function translateWeather(desc: string): string {
  const t: Record<string, string> = {
    "clear sky": "Heldere lucht", "few clouds": "Licht bewolkt",
    "scattered clouds": "Gedeeltelijk bewolkt", "broken clouds": "Zwaar bewolkt",
    "shower rain": "Buien", rain: "Regen", thunderstorm: "Onweer",
    snow: "Sneeuw", mist: "Mist", "overcast clouds": "Geheel bewolkt",
    "light rain": "Lichte regen", "moderate rain": "Matige regen",
    "heavy intensity rain": "Hevige regen", "light snow": "Lichte sneeuw",
    drizzle: "Motregen", haze: "Nevel", fog: "Dichte mist",
  };
  return t[desc.toLowerCase()] || desc;
}

// ── Main script generation function ─────────────────────────

export interface ScriptOptions {
  previousTrack?: SpotifyTrack | null;
  nextTrack?: SpotifyTrack | null;
  weather?: WeatherData | null;
  news?: NewsArticle[];
}

export function generateStationScript(
  stationId: StationId,
  type: ScriptType,
  options: ScriptOptions = {}
): string {
  const station = getStation(stationId);
  const tone = station.djProfile.tone;
  const djName = getDJName(stationId);
  const show = getCurrentShow(station);
  const phrases = TONE_PHRASES[tone];
  const { previousTrack, nextTrack, weather, news } = options;

  const parts: string[] = [];

  switch (type) {
    case "intro": {
      parts.push(
        `${getGreeting()}! Je luistert naar ${show.name} op ${station.label} met ${djName}.`
      );
      parts.push(
        `Het is ${getTimeString()} en we hebben weer geweldige muziek voor je klaarstaan.`
      );
      parts.push(pick(TIME_ADVICE[getTimeOfDayKey()]));

      // Holiday-aware greeting
      const holidayLine = getHolidayDJLine();
      if (holidayLine) {
        parts.push(holidayLine);
      }

      if (Math.random() < 0.2) {
        const genreFacts = GENRE_FUN_FACTS[stationId] || GENRE_FUN_FACTS.default;
        parts.push(`Even een leuk weetje tussendoor: ${pick(genreFacts)}`);
      }

      if (nextTrack) {
        parts.push(
          `We beginnen met ${nextTrack.name} van ${nextTrack.artists[0].name}. ${getInterjection(stationId)}`
        );
      }
      break;
    }

    case "between": {
      if (previousTrack) {
        parts.push(
          `${pick(phrases.filler)} Dat was ${previousTrack.name} van ${previousTrack.artists[0].name}.`
        );
      }

      // 30% chance to realistically read the exact time during a normal transition
      if (Math.random() < 0.3) {
        parts.push(`Het is inmiddels ${getTimeString()} op ${station.label}.`);
      }

      // 15% chance to drop a fun fact right in the middle of a transition
      if (Math.random() < 0.15) {
        const genreFacts = GENRE_FUN_FACTS[stationId] || GENRE_FUN_FACTS.default;
        parts.push(`Wist je dat trouwens? ${pick(genreFacts)}`);
      }

      if (nextTrack) {
        parts.push(
          `${pick(phrases.transition)} ${nextTrack.name}, van ${nextTrack.artists[0].name}.`
        );
      }
      break;
    }

    case "weather": {
      if (previousTrack) {
        parts.push(`Dat was ${previousTrack.name} van ${previousTrack.artists[0].name}.`);
      }
      parts.push("Even het weer.");
      if (weather) {
        parts.push(
          `Het is momenteel ${Math.round(weather.temp)} graden in ${weather.city}. ${translateWeather(weather.description)}.`
        );
        if (weather.wind_speed > 10) {
          parts.push(
            `Het waait behoorlijk met windsnelheden rond de ${Math.round(weather.wind_speed)} kilometer per uur.`
          );
        }
      } else {
        parts.push("Helaas geen weersinformatie beschikbaar op dit moment.");
      }
      if (nextTrack) {
        parts.push(
          `Maar eerst, ${pick(phrases.transition).toLowerCase()} ${nextTrack.name} van ${nextTrack.artists[0].name}.`
        );
      }
      break;
    }

    case "weather_full": {
      parts.push("Tijd voor het weerbericht.");
      if (weather) {
        const temp = Math.round(weather.temp);
        const feels = Math.round(weather.feels_like);
        parts.push(`Het weerbericht voor ${weather.city} en omgeving.`);
        parts.push(`Het is momenteel ${temp} graden, en het voelt als ${feels} graden.`);
        parts.push(`${translateWeather(weather.description)}.`);
        parts.push(`De luchtvochtigheid is ${weather.humidity} procent.`);
        if (weather.wind_speed > 0) {
          parts.push(`De wind waait met ${Math.round(weather.wind_speed)} kilometer per uur.`);
        }
        if (temp < 5) parts.push("Trek je warme jas aan vandaag!");
        else if (temp > 25) parts.push("Vergeet je zonnebrand niet!");
        else if (weather.description.toLowerCase().includes("rain")) {
          parts.push("Neem een paraplu mee voor de zekerheid!");
        }
        parts.push("Dat was het weerbericht.");
      } else {
        parts.push("Helaas is het weerbericht even niet beschikbaar.");
      }
      break;
    }

    case "news": {
      if (previousTrack) {
        parts.push(`${pick(phrases.filler)} Dat was ${previousTrack.name}.`);
      }
      parts.push("Even het laatste nieuws.");
      if (news && news.length > 0) {
        const article = pick(news);
        parts.push(`${article.title}.`);
        if (article.description) {
          const shortDesc = article.description.split(".")[0];
          parts.push(`${shortDesc}.`);
        }
      }
      if (nextTrack) {
        parts.push(
          `En we gaan verder met muziek. ${pick(phrases.transition)} ${nextTrack.name} van ${nextTrack.artists[0].name}.`
        );
      }
      break;
    }

    case "news_full": {
      parts.push("Het is tijd voor het nieuws.");
      parts.push(`Het nieuws van ${getTimeString()} op ${station.label}.`);
      if (news && news.length > 0) {
        const headlines = news.slice(0, 3);
        const ordinals = ["Eerste bericht", "Verder in het nieuws", "En tot slot"];
        headlines.forEach((article, idx) => {
          parts.push(`${ordinals[idx] || "Ook"}: ${article.title}.`);
          if (article.description) {
            const shortDesc = article.description.split(".").slice(0, 2).join(".").trim();
            if (shortDesc) parts.push(`${shortDesc}.`);
          }
        });
        parts.push(`Dat was het nieuws op ${station.label}.`);
      } else {
        parts.push("Er is op dit moment geen nieuws beschikbaar.");
      }
      break;
    }

    case "time": {
      parts.push(
        `Het is ${getTimeString()} op ${station.label}. ${pick(phrases.filler)}`
      );
      parts.push(pick(TIME_ADVICE[getTimeOfDayKey()]));
      if (nextTrack) {
        parts.push(`${pick(phrases.transition)} ${nextTrack.name} van ${nextTrack.artists[0].name}.`);
      }
      break;
    }

    case "station_id": {
      const template = pick(phrases.stationId);
      parts.push(template.replace("{station}", station.label));
      break;
    }

    case "fun_fact": {
      parts.push(pick(phrases.funFact));
      // Use genre-specific facts if available, else default
      const genreFacts = GENRE_FUN_FACTS[stationId] || GENRE_FUN_FACTS.default;
      parts.push(pick(genreFacts));
      if (nextTrack) {
        parts.push(
          `Maar we gaan weer verder met muziek! ${pick(phrases.transition)} ${nextTrack.name} van ${nextTrack.artists[0].name}.`
        );
      }
      break;
    }

    case "song_intro": {
      if (nextTrack) {
        const intros = [
          `En nu, speciaal voor jullie, ${nextTrack.name} van ${nextTrack.artists[0].name}. Van het album ${nextTrack.album.name}. ${getInterjection(stationId)}`,
          `Hier is ie dan, ${nextTrack.artists[0].name} met ${nextTrack.name}!`,
          `${pick(phrases.filler)} ${nextTrack.artists[0].name}, ${nextTrack.name}!`,
          `Dit nummer doet het geweldig, hier is ${nextTrack.artists[0].name} met ${nextTrack.name}!`,
        ];
        parts.push(pick(intros));
      }
      break;
    }

    case "jingle": {
      const jingles = [
        `${station.label}!`,
        `${station.label}, ${station.tagline.toLowerCase()}`,
        `Non-stop muziek op ${station.label}!`,
        `${station.label}, altijd aan!`,
      ];
      parts.push(pick(jingles));
      break;
    }

    case "outro": {
      const todPart = getTimeOfDayKey() === "morning" ? "dag" : getTimeOfDayKey() === "night" ? "nacht" : "avond";
      parts.push(
        `Dat was het weer voor nu op ${station.label}. Bedankt voor het luisteren en tot de volgende keer! ${djName} wenst je een fijne ${todPart}!`
      );
      break;
    }
  }

  const rawText = parts.join(" ");
  return humanize(rawText, tone);
}
