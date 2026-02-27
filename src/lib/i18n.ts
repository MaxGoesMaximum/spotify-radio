/**
 * Multi-Language i18n System
 * Supports NL (Dutch), EN (English), DE (German)
 */

export type Locale = "nl" | "en" | "de";

const translations: Record<Locale, Record<string, string>> = {
    nl: {
        // Navigation
        "nav.home": "Home",
        "nav.radio": "Radio",
        "nav.explore": "Ontdek",
        "nav.stats": "Stats",
        "nav.social": "Sociaal",
        "nav.profile": "Profiel",

        // Player
        "player.play": "Afspelen",
        "player.pause": "Pauzeren",
        "player.next": "Volgend nummer",
        "player.previous": "Vorig nummer",
        "player.volume": "Volume",
        "player.fullscreen": "Volledig scherm",
        "player.sleep": "Slaaptimer",
        "player.connecting": "Verbinden met Spotify...",
        "player.reconnecting": "Opnieuw verbinden...",

        // DJ
        "dj.greeting.morning": "Goedemorgen!",
        "dj.greeting.afternoon": "Goedemiddag!",
        "dj.greeting.evening": "Goedenavond!",
        "dj.greeting.night": "Goedenacht!",

        // Profile
        "profile.settings": "Instellingen",
        "profile.favorites": "Favorieten",
        "profile.history": "Geschiedenis",
        "profile.logout": "Uitloggen",
        "profile.delete": "Account verwijderen",
        "profile.export": "Download mijn gegevens",

        // Cookie consent
        "cookies.title": "Cookies",
        "cookies.message": "Wij gebruiken cookies voor je sessie en voorkeuren.",
        "cookies.accept": "Accepteren",
        "cookies.decline": "Weigeren",

        // Stats
        "stats.tracks": "Nummers",
        "stats.hours": "Uur geluisterd",
        "stats.favorites": "Favorieten",
        "stats.streak": "Dag streak",
        "stats.genres": "Top Genres",
        "stats.artists": "Top Artiesten",
        "stats.activity": "Activiteit",

        // General
        "general.loading": "Laden...",
        "general.error": "Er ging iets mis",
        "general.retry": "Opnieuw proberen",
        "general.save": "Opslaan",
        "general.cancel": "Annuleren",
    },
    en: {
        // Navigation
        "nav.home": "Home",
        "nav.radio": "Radio",
        "nav.explore": "Explore",
        "nav.stats": "Stats",
        "nav.social": "Social",
        "nav.profile": "Profile",

        // Player
        "player.play": "Play",
        "player.pause": "Pause",
        "player.next": "Next track",
        "player.previous": "Previous track",
        "player.volume": "Volume",
        "player.fullscreen": "Fullscreen",
        "player.sleep": "Sleep timer",
        "player.connecting": "Connecting to Spotify...",
        "player.reconnecting": "Reconnecting...",

        // DJ
        "dj.greeting.morning": "Good morning!",
        "dj.greeting.afternoon": "Good afternoon!",
        "dj.greeting.evening": "Good evening!",
        "dj.greeting.night": "Good night!",

        // Profile
        "profile.settings": "Settings",
        "profile.favorites": "Favorites",
        "profile.history": "History",
        "profile.logout": "Log out",
        "profile.delete": "Delete account",
        "profile.export": "Download my data",

        // Cookie consent
        "cookies.title": "Cookies",
        "cookies.message": "We use cookies for your session and preferences.",
        "cookies.accept": "Accept",
        "cookies.decline": "Decline",

        // Stats
        "stats.tracks": "Tracks",
        "stats.hours": "Hours listened",
        "stats.favorites": "Favorites",
        "stats.streak": "Day streak",
        "stats.genres": "Top Genres",
        "stats.artists": "Top Artists",
        "stats.activity": "Activity",

        // General
        "general.loading": "Loading...",
        "general.error": "Something went wrong",
        "general.retry": "Try again",
        "general.save": "Save",
        "general.cancel": "Cancel",
    },
    de: {
        // Navigation
        "nav.home": "Startseite",
        "nav.radio": "Radio",
        "nav.explore": "Entdecken",
        "nav.stats": "Statistiken",
        "nav.social": "Sozial",
        "nav.profile": "Profil",

        // Player
        "player.play": "Abspielen",
        "player.pause": "Pausieren",
        "player.next": "Nächster Titel",
        "player.previous": "Vorheriger Titel",
        "player.volume": "Lautstärke",
        "player.fullscreen": "Vollbild",
        "player.sleep": "Schlaftimer",
        "player.connecting": "Verbindung zu Spotify...",
        "player.reconnecting": "Neuverbindung...",

        // DJ
        "dj.greeting.morning": "Guten Morgen!",
        "dj.greeting.afternoon": "Guten Tag!",
        "dj.greeting.evening": "Guten Abend!",
        "dj.greeting.night": "Gute Nacht!",

        // Profile
        "profile.settings": "Einstellungen",
        "profile.favorites": "Favoriten",
        "profile.history": "Verlauf",
        "profile.logout": "Abmelden",
        "profile.delete": "Konto löschen",
        "profile.export": "Meine Daten herunterladen",

        // Cookie consent
        "cookies.title": "Cookies",
        "cookies.message": "Wir verwenden Cookies für Ihre Sitzung und Einstellungen.",
        "cookies.accept": "Akzeptieren",
        "cookies.decline": "Ablehnen",

        // Stats
        "stats.tracks": "Titel",
        "stats.hours": "Stunden gehört",
        "stats.favorites": "Favoriten",
        "stats.streak": "Tage am Stück",
        "stats.genres": "Top Genres",
        "stats.artists": "Top Künstler",
        "stats.activity": "Aktivität",

        // General
        "general.loading": "Laden...",
        "general.error": "Etwas ist schiefgelaufen",
        "general.retry": "Erneut versuchen",
        "general.save": "Speichern",
        "general.cancel": "Abbrechen",
    },
};

const LOCALE_KEY = "sr_locale";

export function getLocale(): Locale {
    if (typeof window === "undefined") return "nl";
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved && (saved === "nl" || saved === "en" || saved === "de")) return saved;
    // Auto-detect from browser
    const lang = navigator.language.slice(0, 2);
    if (lang === "de") return "de";
    if (lang === "en") return "en";
    return "nl";
}

export function setLocale(locale: Locale): void {
    localStorage.setItem(LOCALE_KEY, locale);
}

export function t(key: string, locale?: Locale): string {
    const l = locale || getLocale();
    return translations[l]?.[key] || translations.nl[key] || key;
}

export const LOCALE_LABELS: Record<Locale, string> = {
    nl: "🇳🇱 Nederlands",
    en: "🇬🇧 English",
    de: "🇩🇪 Deutsch",
};
