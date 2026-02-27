"use client";

import { setVolume } from "@/services/spotify-api";
import { speak, stopSpeaking, preloadTTS, type DJVoice } from "@/services/speech";

interface SegmentOptions {
  duckVolume?: number;   // Volume to duck to (0-1), default 0.08
  fadeInMs?: number;     // Fade down duration, default 600ms
  fadeOutMs?: number;    // Fade up duration, default 600ms
  voice?: DJVoice;       // TTS voice to use
  ttsVolume?: number;    // Volume of the TTS audio (0-1), default 0.9
  rate?: string;         // TTS rate, e.g. "+5%", "-10%"
  pitch?: string;        // TTS pitch, e.g. "+2Hz", "-3Hz"
}

export class AudioCoordinator {
  private isBusy = false;
  private segmentQueue: Array<{ text: string; options: SegmentOptions }> = [];
  private abortController: AbortController | null = null;

  /**
   * Smoothly fade Spotify volume from current to target over duration
   */
  async fadeSpotifyVolume(
    accessToken: string,
    deviceId: string,
    from: number,
    to: number,
    durationMs: number
  ): Promise<void> {
    const steps = 5;
    const stepDuration = durationMs / steps;
    const volumeStep = (to - from) / steps;

    for (let i = 1; i <= steps; i++) {
      const vol = Math.round(from + volumeStep * i);
      try {
        await setVolume(accessToken, deviceId, Math.max(0, Math.min(100, vol)));
      } catch {
        // Continue even if a step fails
      }
      if (i < steps) {
        await this.sleep(stepDuration);
      }
    }
  }

  /**
   * Play a single TTS segment with volume ducking
   */
  async playSegment(
    text: string,
    accessToken: string,
    deviceId: string,
    currentVolume: number,
    options: SegmentOptions = {}
  ): Promise<void> {
    const {
      duckVolume = 0.08,
      fadeInMs = 600,
      fadeOutMs = 600,
      voice = "nl-NL-FennaNeural",
      ttsVolume = 0.9,
    } = options;

    const currentVolumePercent = Math.round(currentVolume * 100);
    const duckVolumePercent = Math.round(duckVolume * 100);

    try {
      // Fade Spotify down
      await this.fadeSpotifyVolume(
        accessToken,
        deviceId,
        currentVolumePercent,
        duckVolumePercent,
        fadeInMs
      );

      // Small pause for natural feel
      await this.sleep(200);

      // Play TTS
      await speak(text, ttsVolume, voice, options.rate, options.pitch);

      // Small pause after speech
      await this.sleep(300);

      // Fade Spotify back up
      await this.fadeSpotifyVolume(
        accessToken,
        deviceId,
        duckVolumePercent,
        currentVolumePercent,
        fadeOutMs
      );
    } catch (error) {
      console.error("Segment playback error:", error);
      // Always try to restore volume
      try {
        await setVolume(accessToken, deviceId, currentVolumePercent);
      } catch { }
    }
  }

  /**
   * Play multiple segments sequentially (e.g., station ID + weather + transition)
   */
  async playSegments(
    segments: Array<{ text: string; options?: SegmentOptions }>,
    accessToken: string,
    deviceId: string,
    currentVolume: number,
    globalOptions: SegmentOptions = {}
  ): Promise<void> {
    if (segments.length === 0) return;
    if (this.isBusy) return;

    this.isBusy = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const currentVolumePercent = Math.round(currentVolume * 100);
    const duckVolume = globalOptions.duckVolume ?? 0.08;
    const duckVolumePercent = Math.round(duckVolume * 100);

    try {
      // Fade down once
      await this.fadeSpotifyVolume(
        accessToken,
        deviceId,
        currentVolumePercent,
        duckVolumePercent,
        globalOptions.fadeInMs ?? 600
      );

      await this.sleep(200);

      // Play all segments
      for (let i = 0; i < segments.length; i++) {
        if (signal.aborted) break;

        const seg = segments[i];
        const voice = seg.options?.voice ?? globalOptions.voice ?? "nl-NL-FennaNeural";
        const ttsVol = seg.options?.ttsVolume ?? globalOptions.ttsVolume ?? 0.9;
        const rate = seg.options?.rate ?? globalOptions.rate;
        const pitch = seg.options?.pitch ?? globalOptions.pitch;

        await speak(seg.text, ttsVol, voice, rate, pitch);

        // Small pause between segments
        if (i < segments.length - 1) {
          await this.sleep(400);
        }
      }

      await this.sleep(300);

      // Fade back up once
      await this.fadeSpotifyVolume(
        accessToken,
        deviceId,
        duckVolumePercent,
        currentVolumePercent,
        globalOptions.fadeOutMs ?? 600
      );
    } catch (error) {
      console.error("Multi-segment playback error:", error);
      try {
        await setVolume(accessToken, deviceId, currentVolumePercent);
      } catch { }
    } finally {
      this.isBusy = false;
    }
  }

  /**
   * Preload upcoming segment audio
   */
  async preloadSegment(text: string, voice?: DJVoice): Promise<void> {
    await preloadTTS(text, voice);
  }

  /**
   * Cancel any ongoing playback
   */
  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
    stopSpeaking();
    this.segmentQueue = [];
    this.isBusy = false;
  }

  get busy(): boolean {
    return this.isBusy;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const audioCoordinator = new AudioCoordinator();
