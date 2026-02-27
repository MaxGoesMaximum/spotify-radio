/**
 * Holiday-aware DJ Script Additions
 * Provides Dutch holiday detection and themed DJ lines
 */

interface Holiday {
    name: string;
    djLines: string[];
    emoji: string;
}

function getEaster(year: number): Date {
    // Meeus/Jones/Butcher algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

export function getTodaysHoliday(): Holiday | null {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-indexed
    const day = now.getDate();
    const year = now.getFullYear();

    // Fixed holidays
    if (month === 1 && day === 1) return {
        name: "Nieuwjaarsdag",
        emoji: "🎆",
        djLines: [
            "Gelukkig Nieuwjaar! Wat een geweldig begin van het jaar!",
            "Nieuwjaarsdag! Tijd voor goede voornemens en goede muziek!",
            "Het nieuwe jaar is begonnen, en wij beginnen met een knaller!",
        ],
    };

    if (month === 4 && day === 27) return {
        name: "Koningsdag",
        emoji: "🧡",
        djLines: [
            "Lang leve de Koning! Gelukkige Koningsdag!",
            "Koningsdag! Alles oranje, alles feest!",
            "Het is Koningsdag! Tijd voor oranje, bier en de beste muziek!",
            "Oranje boven, oranje boven! Gelukkige Koningsdag!",
        ],
    };

    if (month === 5 && day === 4) return {
        name: "Dodenherdenking",
        emoji: "🕯️",
        djLines: [
            "Vandaag herdenken we de gevallenen. Even stil en dankbaar.",
            "4 mei, een moment van bezinning.",
        ],
    };

    if (month === 5 && day === 5) return {
        name: "Bevrijdingsdag",
        emoji: "🕊️",
        djLines: [
            "Gelukkige Bevrijdingsdag! Vrijheid is niet vanzelfsprekend.",
            "5 mei, een dag van vrijheid en feest!",
            "Bevrijdingsdag! We vieren onze vrijheid met de beste muziek!",
        ],
    };

    if (month === 12 && day === 5) return {
        name: "Sinterklaas",
        emoji: "🎅",
        djLines: [
            "Sint is in het land! Heb je je schoen al gezet?",
            "Pakjesavond! Wie heeft er een liedje?",
            "Sinterklaasavond! De spanning is te snijden!",
        ],
    };

    if (month === 12 && (day === 25 || day === 26)) return {
        name: "Kerst",
        emoji: "🎄",
        djLines: [
            "Vrolijk Kerstfeest! Geniet van de feestdagen!",
            "Kerst! De mooiste tijd van het jaar, met de mooiste muziek!",
            "Eerste Kerstdag, gezelligheid troef. Fijne feestdagen!",
        ],
    };

    if (month === 12 && day === 31) return {
        name: "Oudejaarsavond",
        emoji: "🎇",
        djLines: [
            "Oudejaarsavond! Nog even en dan is het nieuw jaar!",
            "Het laatste nummer van het jaar, of toch niet?",
            "We sluiten het jaar af met de allerbeste muziek!",
        ],
    };

    if (month === 2 && day === 14) return {
        name: "Valentijnsdag",
        emoji: "💕",
        djLines: [
            "Happy Valentijnsdag! Speciaal voor jou en je lief!",
            "Valentijn! Een dag vol liefde en romantische muziek!",
        ],
    };

    // Easter-based holidays (variable dates)
    const easter = getEaster(year);
    const easterDay = easter.getDate();
    const easterMonth = easter.getMonth() + 1;

    if (month === easterMonth && day === easterDay) return {
        name: "Pasen",
        emoji: "🐰",
        djLines: [
            "Vrolijk Pasen! Geniet van het paasontbijt!",
            "Eerste Paasdag! De lentekriebels zijn begonnen!",
        ],
    };

    // Kingsnight (26 April)
    if (month === 4 && day === 26) return {
        name: "Koningsnacht",
        emoji: "🎶",
        djLines: [
            "Koningsnacht! De nacht voor het grote feest!",
            "Vanavond gaat het los! Koningsnacht, baby!",
        ],
    };

    return null;
}

export function getHolidayDJLine(): string | null {
    const holiday = getTodaysHoliday();
    if (!holiday) return null;
    const lines = holiday.djLines;
    return lines[Math.floor(Math.random() * lines.length)];
}
