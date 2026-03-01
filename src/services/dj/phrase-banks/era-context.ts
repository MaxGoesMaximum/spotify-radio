// ═══════════════════════════════════════════════════════════════
//  ERA CONTEXT — Decade-specific DJ phrases for Time Machine mode
// ═══════════════════════════════════════════════════════════════

export interface EraContext {
  label: string;
  intros: string[];
  transitions: string[];
  funFacts: string[];
}

const ERA_CONTEXTS: Record<number, EraContext> = {
  1960: {
    label: "de jaren 60",
    intros: [
      "We reizen terug naar de jaren 60! De tijd van flower power, The Beatles en de Stones!",
      "Welkom in de sixties! Het decennium dat alles veranderde!",
      "Stap in de tijdmachine, we gaan naar de jaren 60! Peace and love!",
    ],
    transitions: [
      "Nog meer moois uit de swinging sixties!",
      "De jaren 60 hadden zoveel goede muziek, hier is nog een klassieker!",
      "Terug naar de tijd van vinyl en grote dromen!",
    ],
    funFacts: [
      "Wist je dat The Beatles in 1964 vijf nummers tegelijk in de top 5 hadden?",
      "Wist je dat Woodstock in 1969 meer dan 400.000 bezoekers trok?",
      "Wist je dat de eerste synthesizer in de jaren 60 werd uitgevonden?",
    ],
  },
  1970: {
    label: "de jaren 70",
    intros: [
      "We gaan terug naar de jaren 70! Disco, punk en prog rock!",
      "Welkom in de seventies! Het decennium van de discobal!",
      "De tijdmachine brengt ons naar de jaren 70! Zet je dansschoenen maar aan!",
    ],
    transitions: [
      "Nog meer groovy tracks uit de jaren 70!",
      "De seventies, wat een tijdperk! Hier komt nog eentje!",
      "Terug naar de tijd van flared jeans en funky beats!",
    ],
    funFacts: [
      "Wist je dat Saturday Night Fever in 1977 de disco-rage wereldwijd populair maakte?",
      "Wist je dat punk rock in 1976 in Londen begon met bands als The Sex Pistols?",
      "Wist je dat de Walkman pas in 1979 werd uitgevonden door Sony?",
    ],
  },
  1980: {
    label: "de jaren 80",
    intros: [
      "We gaan terug naar de jaren 80! Synthpop, big hair en neon kleuren!",
      "Welkom in de eighties! Het decennium van MTV en de hits!",
      "De tijdmachine staat op de jaren 80! Iedereen schoudervullingen aan!",
    ],
    transitions: [
      "Nog meer eighties hits! Deze ken je vast!",
      "De jaren 80 blijven geweldig! Hier is nog een topper!",
      "Terug naar de tijd van cassettebandjes en walkmans!",
    ],
    funFacts: [
      "Wist je dat MTV op 1 augustus 1981 begon met Video Killed The Radio Star?",
      "Wist je dat Michael Jackson's Thriller het bestverkochte album aller tijden is?",
      "Wist je dat de CD in 1982 werd geintroduceerd door Philips en Sony?",
    ],
  },
  1990: {
    label: "de jaren 90",
    intros: [
      "We reizen naar de jaren 90! Grunge, eurodance en boyband-gekte!",
      "Welkom in de nineties! Het decennium van Nirvana tot de Spice Girls!",
      "De tijdmachine brengt ons naar de jaren 90! Nostalgie gegarandeerd!",
    ],
    transitions: [
      "Nog meer negentig-er klassiekers voor jullie!",
      "De jaren 90, onvergetelijk! Hier is nog eentje!",
      "Terug naar de tijd van baggy jeans en flip phones!",
    ],
    funFacts: [
      "Wist je dat Napster in 1999 de muziekindustrie voorgoed veranderde?",
      "Wist je dat het Eurovisie Songfestival in 1999 meer dan 100 miljoen kijkers had?",
      "Wist je dat de Macarena in 1996 de langst op nummer 1 staande hit was?",
    ],
  },
  2000: {
    label: "de jaren 00",
    intros: [
      "We gaan naar de jaren 2000! De tijd van iPods en mp3's!",
      "Welkom in de noughties! Het decennium van Beyonce tot Eminem!",
      "De tijdmachine brengt ons naar de jaren 00! Millennium hits!",
    ],
    transitions: [
      "Nog meer hits uit de jaren 2000!",
      "Het nieuwe millennium had geweldige muziek, hier is er nog eentje!",
      "Terug naar de tijd van MSN en ringtones!",
    ],
    funFacts: [
      "Wist je dat iTunes in 2003 de manier waarop we muziek kopen voorgoed veranderde?",
      "Wist je dat YouTube in 2005 werd gelanceerd met een video in een dierentuin?",
      "Wist je dat de iPod in 2001 1000 nummers in je broekzak beloofde?",
    ],
  },
  2010: {
    label: "de jaren 10",
    intros: [
      "We gaan naar de jaren 2010! Streaming, EDM en social media hits!",
      "Welkom in de tens! Het decennium van Drake tot Adele!",
      "De tijdmachine staat op de jaren 10! Recent maar al nostalgisch!",
    ],
    transitions: [
      "Nog meer bangers uit de jaren 10!",
      "De jaren 10, wat een tijdperk voor muziek!",
      "Streaming maakte alles mogelijk, hier is nog een hit!",
    ],
    funFacts: [
      "Wist je dat Gangnam Style in 2012 het eerste YouTube-filmpje was met meer dan 1 miljard views?",
      "Wist je dat Spotify in 2012 naar Nederland kwam?",
      "Wist je dat Ed Sheeran zijn doorbraak had via YouTube voor hij een platencontract kreeg?",
    ],
  },
  2020: {
    label: "de jaren 20",
    intros: [
      "We zitten in de jaren 20! De muziek van nu!",
      "Het huidige decennium! Vers van de pers!",
      "De nieuwste hits van de jaren 20! Alles van nu!",
    ],
    transitions: [
      "Nog meer van de nieuwste muziek!",
      "De jaren 20 brengen ons de freshste tracks!",
      "Helemaal actueel, hier is nog een hit!",
    ],
    funFacts: [
      "Wist je dat TikTok de manier waarop muziek viral gaat compleet heeft veranderd?",
      "Wist je dat AI-gegenereerde muziek steeds populairder wordt?",
      "Wist je dat vinyl platen weer meer verkocht worden dan CD's?",
    ],
  },
};

export function getEraContext(decade: number): EraContext {
  return ERA_CONTEXTS[decade] || ERA_CONTEXTS[2020];
}

export function getEraIntro(decade: number): string {
  const ctx = getEraContext(decade);
  return ctx.intros[Math.floor(Math.random() * ctx.intros.length)];
}

export function getEraTransition(decade: number): string {
  const ctx = getEraContext(decade);
  return ctx.transitions[Math.floor(Math.random() * ctx.transitions.length)];
}

export function getEraFunFact(decade: number): string {
  const ctx = getEraContext(decade);
  return ctx.funFacts[Math.floor(Math.random() * ctx.funFacts.length)];
}

export const AVAILABLE_DECADES = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
