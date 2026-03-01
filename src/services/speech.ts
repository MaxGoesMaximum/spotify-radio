"use client";

import type { DJVoice } from "@/types";
export type { DJVoice };

let currentAudio: HTMLAudioElement | null = null;

// Client-side blob URL cache
const blobCache = new Map<string, { url: string; timestamp: number }>();
const BLOB_CACHE_TTL = 20 * 60 * 1000; // 20 minutes
const MAX_BLOB_CACHE_SIZE = 50;

function cleanBlobCache() {
  const now = Date.now();
  for (const [key, value] of blobCache.entries()) {
    if (now - value.timestamp > BLOB_CACHE_TTL) {
      URL.revokeObjectURL(value.url);
      blobCache.delete(key);
    }
  }
  // Evict oldest entries if over size cap
  while (blobCache.size > MAX_BLOB_CACHE_SIZE) {
    const oldestKey = blobCache.keys().next().value;
    if (oldestKey) {
      const entry = blobCache.get(oldestKey);
      if (entry) URL.revokeObjectURL(entry.url);
      blobCache.delete(oldestKey);
    } else break;
  }
}

function getCacheKey(text: string, voice: DJVoice, rate?: string, pitch?: string): string {
  return `${voice}:${rate || ""}:${pitch || ""}:${text.substring(0, 100)}:${text.length}`;
}

async function fetchTTSAudio(
  text: string,
  voice: DJVoice,
  rate?: string,
  pitch?: string
): Promise<string> {
  const cacheKey = getCacheKey(text, voice, rate, pitch);

  // Check client cache
  cleanBlobCache();
  const cached = blobCache.get(cacheKey);
  if (cached) return cached.url;

  // Auto-detect SSML content
  const hasSSML = text.includes("<break") || text.includes("<emphasis") || text.includes("<prosody");

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, rate, pitch, ssml: hasSSML || undefined }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const blobUrl = URL.createObjectURL(audioBlob);

  // Cache it
  blobCache.set(cacheKey, { url: blobUrl, timestamp: Date.now() });

  return blobUrl;
}

let currentPlaybackToken = 0;

export async function speak(
  text: string,
  volume: number = 0.9,
  voice: DJVoice = "nl-NL-FennaNeural",
  rate?: string,
  pitch?: string
): Promise<void> {
  // Increment token so any pending async fetches know they are stale
  const myToken = ++currentPlaybackToken;

  // Stop any ongoing speech
  stopSpeaking();

  try {
    const blobUrl = await fetchTTSAudio(text, voice, rate, pitch);

    // If another speak() was called while we were fetching the audio, abort!
    if (myToken !== currentPlaybackToken) {
      console.log("TTS aborted due to newer speech request.");
      return;
    }

    return new Promise<void>((resolve) => {
      const audio = new Audio(blobUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      // Tag so AudioEQ manager skips this element
      audio.dataset.ttsAudio = "true";
      currentAudio = audio;

      audio.onended = () => {
        if (myToken === currentPlaybackToken) currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        if (myToken === currentPlaybackToken) {
          currentAudio = null;
          console.warn("TTS audio playback error, falling back to Web Speech");
          fallbackSpeak(text, volume).then(resolve);
        } else {
          resolve();
        }
      };

      audio.play().catch(() => {
        if (myToken === currentPlaybackToken) {
          currentAudio = null;
          fallbackSpeak(text, volume).then(resolve);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    if (myToken !== currentPlaybackToken) return;
    console.warn("TTS fetch error, falling back to Web Speech:", error);
    return fallbackSpeak(text, volume);
  }
}

// Preload TTS audio for smoother playback (with same rate/pitch as playback for cache hit)
export async function preloadTTS(
  text: string,
  voice: DJVoice = "nl-NL-FennaNeural",
  rate?: string,
  pitch?: string
): Promise<void> {
  try {
    await fetchTTSAudio(text, voice, rate, pitch);
  } catch {
    // Silently fail preload
  }
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }
  // Also stop Web Speech fallback
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (currentAudio && !currentAudio.paused) return true;
  if (typeof window !== "undefined") {
    return window.speechSynthesis?.speaking ?? false;
  }
  return false;
}

// Web Speech API fallback (if Edge TTS fails)
function fallbackSpeak(text: string, volume: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = volume;

    const voices = window.speechSynthesis.getVoices();
    const dutchVoice = voices.find((v) => v.lang.startsWith("nl"));
    if (dutchVoice) {
      utterance.voice = dutchVoice;
      utterance.lang = dutchVoice.lang;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
