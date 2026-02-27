import { z } from "zod";

// --- User Preferences ---
export const updatePreferencesSchema = z.object({
  theme: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  lastStation: z.string().optional(),
  djVoice: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  djFrequency: z.enum(["low", "normal", "high"]).optional(),
  crossfade: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// --- Favorites ---
export const addFavoriteSchema = z.object({
  trackId: z.string().min(1),
  trackName: z.string().min(1),
  artistName: z.string().min(1),
  albumName: z.string().min(1),
  albumImage: z.string().nullable().optional(),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;

export const removeFavoriteSchema = z.object({
  trackId: z.string().min(1),
});

// --- History ---
export const addHistorySchema = z.object({
  trackId: z.string().min(1),
  trackName: z.string().min(1),
  artistName: z.string().min(1),
  albumName: z.string().min(1),
  albumImage: z.string().nullable().optional(),
  genre: z.string().min(1),
  durationMs: z.number().int().nonnegative().optional(),
});

export type AddHistoryInput = z.infer<typeof addHistorySchema>;

// --- TTS ---
export const ttsRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  voice: z.string().optional(),
  rate: z.string().optional(),
  pitch: z.string().optional(),
});

// --- Weather ---
export const weatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

// --- News ---
export const newsQuerySchema = z.object({
  city: z.string().min(1).max(100).optional(),
});

// --- Pagination ---
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
