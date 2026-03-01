"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface RecapStats {
  totalTracks: number;
  totalFavorites: number;
  totalMinutes: number;
  totalHours: number;
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  topTracks: { id: string; title: string; artist: string; albumArt: string | null; count: number }[];
  listeningStreak: number;
  activeDaysLast30: number;
  memberSince: string | null;
}

const CARDS = [
  "welcome",
  "listening_time",
  "top_artist",
  "top_genres",
  "top_tracks",
  "discovery",
  "streak",
  "personality",
] as const;

type CardId = (typeof CARDS)[number];

const CARD_COLORS: Record<CardId, string> = {
  welcome: "from-indigo-600 to-purple-700",
  listening_time: "from-emerald-600 to-teal-700",
  top_artist: "from-rose-600 to-pink-700",
  top_genres: "from-amber-600 to-orange-700",
  top_tracks: "from-cyan-600 to-blue-700",
  discovery: "from-violet-600 to-indigo-700",
  streak: "from-red-600 to-rose-700",
  personality: "from-fuchsia-600 to-purple-700",
};

function getDJPersonality(stats: RecapStats): { label: string; emoji: string; description: string } {
  const topGenre = stats.topGenres[0]?.genre || "pop";
  const tracksPerDay = stats.totalTracks / Math.max(1, stats.activeDaysLast30);

  if (tracksPerDay > 30) return { label: "De Muziekverslaafde", emoji: "🎵", description: "Je luistert meer dan de meeste mensen! Muziek is je brandstof." };
  if (stats.listeningStreak >= 7) return { label: "De Trouwe Luisteraar", emoji: "🎧", description: "Dag na dag, nummer na nummer. Jij bent er altijd." };
  if (stats.topGenres.length >= 4) return { label: "De Genre-Ontdekker", emoji: "🌍", description: "Van jazz tot hip-hop, jij houdt van variatie!" };

  const genreLabels: Record<string, { label: string; emoji: string; description: string }> = {
    pop: { label: "De Pop-Liefhebber", emoji: "✨", description: "Altijd op de hoogte van de nieuwste hits!" },
    rock: { label: "De Rocker", emoji: "🤘", description: "Gitaren, drums en attitude. Dat is jouw vibe!" },
    jazz: { label: "De Jazz-Kenner", emoji: "🎷", description: "Smooth, verfijnd en met smaak. Klasse." },
    hiphop: { label: "De Beat-Master", emoji: "🎤", description: "Beats, bars en flow. De straat is jouw podium!" },
    classical: { label: "De Klassieke Ziel", emoji: "🎻", description: "Tijdloze muziek voor een tijdloze smaak." },
    dance: { label: "De Dansmasjien", emoji: "💃", description: "Als het maar beweegt! Jij leeft voor het ritme." },
    chill: { label: "De Chiller", emoji: "😎", description: "Relaxed en laid-back. Geen stress, alleen vibes." },
    dutch: { label: "De Hollandse Held", emoji: "🇳🇱", description: "Nederlandse muziek door en door!" },
  };

  return genreLabels[topGenre] || { label: "De Muziekliefhebber", emoji: "🎶", description: "Muziek maakt je wereld mooier!" };
}

export default function RecapPage() {
  const [stats, setStats] = useState<RecapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nextCard = () => {
    if (currentCard < CARDS.length - 1) {
      setDirection(1);
      setCurrentCard((c) => c + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard((c) => c - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Je recap laden...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-4xl">🎵</p>
          <h1 className="text-xl font-bold text-white">Geen data beschikbaar</h1>
          <p className="text-white/40 text-sm">
            Luister eerst wat muziek op Spotify Radio, dan maken we je persoonlijke recap!
          </p>
          <Link
            href="/radio"
            className="inline-block mt-4 px-6 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            Naar de radio
          </Link>
        </div>
      </div>
    );
  }

  const personality = getDJPersonality(stats);
  const cardId = CARDS[currentCard];

  const renderCard = () => {
    switch (cardId) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl"
            >
              📻
            </motion.p>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Jouw Spotify Radio Recap</h1>
              <p className="text-white/60 text-sm">Laten we eens kijken naar je luistergewoontes!</p>
            </div>
          </div>
        );

      case "listening_time":
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl font-bold text-white"
            >
              {stats.totalHours}
              <span className="text-2xl text-white/60 ml-2">uur</span>
            </motion.div>
            <p className="text-white/60">
              Je hebt <span className="text-white font-semibold">{stats.totalTracks} nummers</span> geluisterd
            </p>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalFavorites}</div>
                <div className="text-white/40 text-xs">Favorieten</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.activeDaysLast30}</div>
                <div className="text-white/40 text-xs">Actieve dagen</div>
              </div>
            </div>
          </div>
        );

      case "top_artist":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white text-center">Top Artiesten</h2>
            <div className="space-y-3">
              {stats.topArtists.slice(0, 5).map((artist, idx) => (
                <motion.div
                  key={artist.artist}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl font-bold text-white/20 w-8">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{artist.artist}</div>
                    <div className="text-white/40 text-xs">{artist.count}x gedraaid</div>
                  </div>
                  <div className="h-1.5 flex-1 max-w-24 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(artist.count / stats.topArtists[0].count) * 100}%` }}
                      transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                      className="h-full bg-white/40 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "top_genres":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white text-center">Genre Mix</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {stats.topGenres.map((genre, idx) => {
                const total = stats.topGenres.reduce((s, g) => s + g.count, 0);
                const pct = Math.round((genre.count / total) * 100);
                return (
                  <motion.div
                    key={genre.genre}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.15, type: "spring" }}
                    className="px-4 py-2 rounded-full bg-white/10 border border-white/10"
                    style={{ fontSize: `${Math.max(12, 14 + (4 - idx) * 3)}px` }}
                  >
                    <span className="text-white font-semibold">{genre.genre}</span>
                    <span className="text-white/40 ml-1.5 text-xs">{pct}%</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case "top_tracks":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">Meest Gespeeld</h2>
            <div className="space-y-2">
              {stats.topTracks.slice(0, 5).map((track, idx) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                >
                  <span className="text-lg font-bold text-white/20 w-6 text-center">{idx + 1}</span>
                  {track.albumArt && (
                    <img src={track.albumArt} alt="" className="w-10 h-10 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{track.title}</div>
                    <div className="text-white/40 text-xs truncate">{track.artist}</div>
                  </div>
                  <span className="text-white/30 text-xs">{track.count}x</span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "discovery":
        return (
          <div className="text-center space-y-6">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl"
            >
              🔍
            </motion.p>
            <h2 className="text-xl font-bold text-white">Ontdekkingen</h2>
            <p className="text-white/60 text-sm">
              Je hebt <span className="text-white font-semibold">{stats.topArtists.length}+</span> artiesten ontdekt
              via <span className="text-white font-semibold">{stats.topGenres.length}</span> genres
            </p>
          </div>
        );

      case "streak":
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl"
            >
              🔥
            </motion.div>
            <div>
              <div className="text-4xl font-bold text-white">
                {stats.listeningStreak} {stats.listeningStreak === 1 ? "dag" : "dagen"}
              </div>
              <p className="text-white/60 text-sm mt-2">Luisterstreak</p>
            </div>
            {stats.memberSince && (
              <p className="text-white/30 text-xs">
                Lid sinds {new Date(stats.memberSince).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        );

      case "personality":
        return (
          <div className="text-center space-y-6">
            <motion.p
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-7xl"
            >
              {personality.emoji}
            </motion.p>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">{personality.label}</h2>
              <p className="text-white/60 text-sm max-w-xs mx-auto">{personality.description}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/radio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Terug
        </Link>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {CARDS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentCard ? 1 : -1);
              setCurrentCard(idx);
            }}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentCard
              ? "bg-white w-6"
              : idx < currentCard
                ? "bg-white/40"
                : "bg-white/15"
              }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm aspect-[3/4] relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={cardId}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${CARD_COLORS[cardId]} p-8 flex flex-col items-center justify-center shadow-2xl overflow-hidden`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/20 translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full">
              {renderCard()}
            </div>

            {/* Card number */}
            <div className="absolute bottom-4 right-4 text-white/20 text-xs">
              {currentCard + 1}/{CARDS.length}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-6">
        <motion.button
          onClick={prevCard}
          disabled={currentCard === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </motion.button>

        <motion.button
          onClick={nextCard}
          disabled={currentCard === CARDS.length - 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </motion.button>
      </div>

      {/* Swipe hint */}
      {currentCard === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/20 text-xs mt-4"
        >
          Klik op de pijlen om door je recap te navigeren
        </motion.p>
      )}
    </div>
  );
}
