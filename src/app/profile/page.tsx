"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSpotifySession } from "@/hooks/useSpotifySession";
import Image from "next/image";

interface Stats {
  totalTracks: number;
  totalFavorites: number;
  totalMinutes: number;
  totalHours: number;
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  listeningStreak: number;
  activeDaysLast30: number;
  memberSince: string | null;
}

interface Favorite {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImage: string | null;
}

interface HistoryEntry {
  id: string;
  trackName: string;
  artistName: string;
  albumImage: string | null;
  genre: string;
  playedAt: string;
}

interface Preferences {
  theme: string;
  volume: number;
  lastStation: string;
  djVoice: string;
  notificationsEnabled: boolean;
  djFrequency: string;
  crossfade: boolean;
}

export default function ProfilePage() {
  const { session, status } = useSpotifySession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "favorites" | "history" | "settings">("stats");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, favsRes, histRes, prefsRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/user/favorites?limit=20"),
        fetch("/api/user/history?limit=30"),
        fetch("/api/user/preferences"),
      ]);

      const [statsData, favsData, histData, prefsData] = await Promise.all([
        statsRes.json(),
        favsRes.json(),
        histRes.json(),
        prefsRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (favsData.favorites) setFavorites(favsData.favorites);
      if (histData.history) setHistory(histData.history);
      if (prefsData.preferences) setPreferences(prefsData.preferences);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  const handleLogout = async () => {
    await fetch("/api/spotify/logout", { method: "POST" });
    router.push("/");
  };

  const handlePreferenceChange = async (key: string, value: string | number | boolean) => {
    const updated = { ...preferences, [key]: value } as Preferences;
    setPreferences(updated);
    await fetch("/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radio-bg">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-radio-accent/15 border-t-radio-accent animate-spin" />
          </div>
          <p className="text-white/20 text-xs tracking-widest uppercase">Profiel laden...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "stats" as const, label: "Statistieken", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
    { id: "favorites" as const, label: "Favorieten", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
    { id: "history" as const, label: "Geschiedenis", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "settings" as const, label: "Instellingen", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" },
  ];

  return (
    <div className="min-h-screen bg-radio-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 sm:px-8 pt-8 pb-6"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "Profile"}
              width={80}
              height={80}
              className="rounded-full border-2 border-white/10 shadow-2xl"
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              {session.user?.name}
            </h1>
            <p className="text-white/40 text-sm mt-1">{session.user?.email}</p>
            {stats?.memberSince && (
              <p className="text-white/25 text-xs mt-1">
                Lid sinds {new Date(stats.memberSince).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="ml-auto">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-white/40 hover:text-white/60"
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Nummers" value={stats.totalTracks} icon="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  <StatCard label="Uur geluisterd" value={stats.totalHours} icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <StatCard label="Favorieten" value={stats.totalFavorites} icon="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  <StatCard label="Dag streak" value={stats.listeningStreak} icon="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 6.51 6.51 0 009 4.5a6.5 6.5 0 016.362.714z" />
                </div>

                {/* Top Genres */}
                {stats.topGenres.length > 0 && (
                  <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                    <h3 className="text-white/80 text-sm font-semibold mb-4">Top Genres</h3>
                    <div className="space-y-3">
                      {stats.topGenres.map((g, i) => (
                        <div key={g.genre} className="flex items-center gap-3">
                          <span className="text-white/30 text-xs w-5 text-right font-mono">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/80 text-sm capitalize">{g.genre}</span>
                              <span className="text-white/30 text-xs">{g.count} tracks</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(g.count / stats.topGenres[0].count) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-full bg-radio-accent/60 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Artists */}
                {stats.topArtists.length > 0 && (
                  <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                    <h3 className="text-white/80 text-sm font-semibold mb-4">Top Artiesten</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stats.topArtists.map((a, i) => (
                        <div key={a.artist} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                          <span className="text-white/20 text-xs w-5 text-right font-mono">{i + 1}</span>
                          <span className="text-white/70 text-sm truncate flex-1">{a.artist}</span>
                          <span className="text-white/25 text-xs">{a.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {favorites.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 mx-auto text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <p className="text-white/30 text-sm">Nog geen favorieten opgeslagen</p>
                    <p className="text-white/15 text-xs mt-1">Druk op het hartje bij een nummer om het hier te zien</p>
                  </div>
                ) : (
                  favorites.map((fav) => (
                    <div key={fav.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                      {fav.albumImage && (
                        <Image src={fav.albumImage} alt={fav.albumName} width={44} height={44} className="rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-medium truncate">{fav.trackName}</p>
                        <p className="text-white/40 text-xs truncate">{fav.artistName}</p>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 mx-auto text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white/30 text-sm">Nog geen luistergeschiedenis</p>
                    <p className="text-white/15 text-xs mt-1">Luister naar de radio om je geschiedenis te vullen</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      {entry.albumImage && (
                        <Image src={entry.albumImage} alt="" width={40} height={40} className="rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm truncate">{entry.trackName}</p>
                        <p className="text-white/35 text-xs truncate">{entry.artistName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white/20 text-[10px] capitalize">{entry.genre}</p>
                        <p className="text-white/15 text-[10px]">
                          {new Date(entry.playedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && preferences && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 space-y-5">
                  <h3 className="text-white/80 text-sm font-semibold">Voorkeuren</h3>

                  {/* Theme */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Thema</p>
                      <p className="text-white/30 text-xs">Kies je interface stijl</p>
                    </div>
                    <select
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white/70 text-sm appearance-none cursor-pointer"
                    >
                      <option value="dark">Apple Dark</option>
                      <option value="midnight">Midnight</option>
                      <option value="light">Light</option>
                      <option value="sunset">Sunset</option>
                      <option value="ocean">Ocean</option>
                    </select>
                  </div>

                  {/* DJ Voice */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">DJ Stem</p>
                      <p className="text-white/30 text-xs">Kies je favoriete DJ</p>
                    </div>
                    <select
                      value={preferences.djVoice}
                      onChange={(e) => handlePreferenceChange("djVoice", e.target.value)}
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white/70 text-sm appearance-none cursor-pointer"
                    >
                      <option value="nl-NL-FennaNeural">DJ Fenna</option>
                      <option value="nl-NL-ColetteNeural">DJ Colette</option>
                      <option value="nl-NL-MaartenNeural">DJ Maarten</option>
                    </select>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Meldingen</p>
                      <p className="text-white/30 text-xs">Ontvang meldingen bij nieuw nummer</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange("notificationsEnabled", !preferences.notificationsEnabled)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${preferences.notificationsEnabled ? "bg-radio-accent" : "bg-white/[0.1]"
                        }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${preferences.notificationsEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                        }`} />
                    </button>
                  </div>
                  {/* DJ Frequency */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">DJ Frequentie</p>
                      <p className="text-white/30 text-xs">Hoe vaak spreekt de DJ?</p>
                    </div>
                    <select
                      value={preferences.djFrequency || "normal"}
                      onChange={(e) => handlePreferenceChange("djFrequency", e.target.value)}
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white/70 text-sm appearance-none cursor-pointer"
                    >
                      <option value="low">Zelden</option>
                      <option value="normal">Normaal</option>
                      <option value="high">Vaak</option>
                    </select>
                  </div>

                  {/* Crossfade */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Spotify Crossfade</p>
                      <p className="text-white/30 text-xs">Vloeiende overgangen (DJ script)</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange("crossfade", !preferences.crossfade)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${preferences.crossfade ? "bg-radio-accent" : "bg-white/[0.1]"
                        }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${preferences.crossfade ? "translate-x-[22px]" : "translate-x-0.5"
                        }`} />
                    </button>
                  </div>
                </div>

                {/* Data & Privacy */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5">
                  <h3 className="text-white/60 text-sm font-semibold mb-3">🔒 Privacy & Gegevens</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        window.location.href = "/api/user/export";
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] text-left transition-colors group"
                    >
                      <svg className="w-4 h-4 text-radio-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <div>
                        <p className="text-white/70 text-sm font-medium">Download mijn gegevens</p>
                        <p className="text-white/30 text-[11px]">GDPR data export — al je gegevens als JSON</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/[0.03] rounded-2xl border border-red-500/[0.08] p-5">
                  <h3 className="text-red-400/80 text-sm font-semibold mb-3">Account</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                    >
                      Uitloggen
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
                        if (!confirm("LAATSTE WAARSCHUWING: Al je gegevens, favorieten en luistergeschiedenis worden permanent verwijderd.")) return;
                        const res = await fetch("/api/user/account", { method: "DELETE" });
                        if (res.ok) {
                          window.location.href = "/";
                        } else {
                          alert("Verwijderen mislukt. Probeer het later opnieuw.");
                        }
                      }}
                      className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400/60 text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      Account verwijderen
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4"
    >
      <svg className="w-5 h-5 text-radio-accent/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <p className="text-2xl font-bold text-white font-heading">{value.toLocaleString("nl-NL")}</p>
      <p className="text-white/30 text-xs mt-0.5">{label}</p>
    </motion.div>
  );
}
