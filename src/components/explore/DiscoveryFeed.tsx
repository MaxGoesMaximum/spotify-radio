"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkSavedTracks, saveTrack } from "@/services/spotify-api";
import { useToastStore } from "@/store/toast-store";
import Image from "next/image";
import { getStation, type StationId } from "@/config/stations";

interface DiscoveryEntry {
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImage: string | null;
  genre: string;
  playedAt: string;
}

interface DiscoveryFeedProps {
  accessToken: string;
}

export function DiscoveryFeed({ accessToken }: DiscoveryFeedProps) {
  const [entries, setEntries] = useState<DiscoveryEntry[]>([]);
  const [newTrackIds, setNewTrackIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  // Fetch discoveries from API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/user/discoveries?days=7");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setEntries(data.discoveries || []);

        // Check which tracks are NOT in the user's library (batch by 50)
        const trackIds: string[] = (data.discoveries || []).map((e: DiscoveryEntry) => e.trackId);
        if (trackIds.length === 0) return;

        const newIds = new Set<string>();
        for (let i = 0; i < trackIds.length; i += 50) {
          const batch = trackIds.slice(i, i + 50);
          try {
            const results = await checkSavedTracks(accessToken, batch);
            batch.forEach((id, idx) => {
              if (!results[idx]) newIds.add(id);
            });
          } catch {
            // If check fails, assume all are new
            batch.forEach((id) => newIds.add(id));
          }
        }

        if (!cancelled) setNewTrackIds(newIds);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [accessToken]);

  // Filter to only "new" tracks
  const discoveries = entries.filter((e) => newTrackIds.has(e.trackId));

  // Unique new artists
  const newArtists = [...new Set(discoveries.map((e) => e.artistName))];

  const handleSaveTrack = useCallback(async (trackId: string) => {
    try {
      await saveTrack(accessToken, trackId);
      setSavedIds((prev) => new Set([...prev, trackId]));
      addToast("Opgeslagen in Spotify", "success", 2000);
    } catch {
      addToast("Opslaan mislukt", "error", 2000);
    }
  }, [accessToken, addToast]);

  const handleSaveAll = async () => {
    if (isSavingPlaylist || discoveries.length === 0) return;
    setIsSavingPlaylist(true);

    try {
      const trackUris = discoveries.map((e) => `spotify:track:${e.trackId}`);
      const dateStr = new Date().toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const name = `Spotify Radio Ontdekkingen \u2022 Week van ${dateStr}`;

      const res = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, trackUris }),
      });

      if (res.status === 403) {
        addToast("Opnieuw inloggen vereist voor playlists", "error", 5000);
        return;
      }

      if (!res.ok) {
        addToast("Playlist aanmaken mislukt", "error", 3000);
        return;
      }

      const data = await res.json();
      setPlaylistUrl(data.playlistUrl);
      addToast("Ontdekkingen opgeslagen als playlist!", "success", 4000);
    } catch {
      addToast("Playlist aanmaken mislukt", "error", 3000);
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (discoveries.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
          <svg className="w-8 h-8 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white/40 mb-2">Nog geen ontdekkingen</h3>
        <p className="text-sm text-white/20 max-w-md mx-auto">
          Luister naar de radio om nieuwe muziek te ontdekken. Nummers die niet in je Spotify bibliotheek staan verschijnen hier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with save-all button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {discoveries.length} ontdekkingen deze week
          </h2>
          <p className="text-sm text-white/30 mt-1">
            Nummers die nieuw zijn voor jou
          </p>
        </div>

        <div className="flex items-center gap-3">
          {playlistUrl && (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20 text-[#1DB954] text-xs font-medium hover:bg-[#1DB954]/20 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Open in Spotify
            </a>
          )}
          <motion.button
            onClick={handleSaveAll}
            disabled={isSavingPlaylist}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
          >
            {isSavingPlaylist ? (
              <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Sla alles op als playlist
          </motion.button>
        </div>
      </div>

      {/* New artists */}
      {newArtists.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">
            Nieuwe artiesten ({newArtists.length})
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {newArtists.slice(0, 20).map((artist) => (
              <span
                key={artist}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/50 whitespace-nowrap"
              >
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discovery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {discoveries.map((entry, idx) => {
            const isSaved = savedIds.has(entry.trackId);
            let stationColor = "#888";
            try {
              const station = getStation(entry.genre as StationId);
              stationColor = station.color;
            } catch { /* fallback */ }

            return (
              <motion.div
                key={entry.trackId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors group"
              >
                {/* Album art */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.03]">
                  {entry.albumImage ? (
                    <Image src={entry.albumImage} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      {"\u266b"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate font-medium">
                    {entry.trackName}
                  </div>
                  <div className="text-xs text-white/30 truncate">
                    {entry.artistName}
                  </div>
                  <span
                    className="inline-block mt-1 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full border"
                    style={{
                      color: stationColor,
                      borderColor: `${stationColor}25`,
                      backgroundColor: `${stationColor}08`,
                    }}
                  >
                    {entry.genre}
                  </span>
                </div>

                {/* Save button */}
                <motion.button
                  onClick={() => handleSaveTrack(entry.trackId)}
                  disabled={isSaved}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${isSaved
                    ? "text-[#1DB954]"
                    : "text-white/20 hover:text-white/60 hover:bg-white/[0.06]"
                    }`}
                  title={isSaved ? "Opgeslagen" : "Opslaan in Spotify"}
                >
                  <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
