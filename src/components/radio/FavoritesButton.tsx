"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { saveTrack, removeTrack } from "@/services/spotify-api";
import { updateTasteProfile } from "@/services/music-selector";
import { useToastStore } from "@/store/toast-store";

interface FavoritesButtonProps {
  accessToken: string;
}

export function FavoritesButton({ accessToken }: FavoritesButtonProps) {
  const currentTrack = useRadioStore((s) => s.currentTrack);
  const favorites = useRadioStore((s) => s.favorites);
  const toggleFavorite = useRadioStore((s) => s.toggleFavorite);

  const addToast = useToastStore((s) => s.addToast);

  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;

  const handleToggle = useCallback(async () => {
    if (!currentTrack) return;

    toggleFavorite(currentTrack.id);

    // Update taste profile for music selector (like = bias toward similar artists)
    if (!isFav) {
      updateTasteProfile("like", currentTrack);
    }

    // Sync with Spotify + database
    try {
      if (isFav) {
        await removeTrack(accessToken, currentTrack.id);
        fetch("/api/user/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: currentTrack.id }),
        }).catch(() => { });
        addToast("Verwijderd uit favorieten", "info", 2000);
      } else {
        await saveTrack(accessToken, currentTrack.id);
        fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackId: currentTrack.id,
            trackName: currentTrack.name,
            artistName: currentTrack.artists.map((a) => a.name).join(", "),
            albumName: currentTrack.album.name,
            albumImage: currentTrack.album.images?.[0]?.url || null,
          }),
        }).catch(() => { });
        addToast("Toegevoegd aan favorieten ❤️", "success", 2000);
      }
    } catch (error) {
      // Revert on failure
      toggleFavorite(currentTrack.id);
      addToast("Kon favoriet niet opslaan", "error");
      console.error("Failed to sync favorite:", error);
    }
  }, [currentTrack, isFav, accessToken, toggleFavorite, addToast]);

  if (!currentTrack) return null;

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.8 }}
      className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      title={isFav ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      <motion.svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        animate={isFav ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <path
          d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
          fill={isFav ? "#ff4444" : "none"}
          stroke={isFav ? "#ff4444" : "rgba(255,255,255,0.4)"}
          strokeWidth={isFav ? 0 : 1.5}
        />
      </motion.svg>

      {/* Sparkle effect on favorite */}
      {isFav && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full border-2 border-red-400/50"
        />
      )}
    </motion.button>
  );
}
