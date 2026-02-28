import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import "node-edge-tts"; // Force Vercel NFT to trace and include this module in production

// Force Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple in-memory cache for TTS audio (text hash -> { buffer, timestamp })
const cache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ── Circuit Breaker ─────────────────────────────────────────
// Prevents spawning failing TTS workers when the service is down

interface CircuitState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
  openedAt: number;
}

const circuit: CircuitState = {
  failureCount: 0,
  lastFailureTime: 0,
  isOpen: false,
  openedAt: 0,
};

const CIRCUIT_FAILURE_THRESHOLD = 3;  // Open after 3 consecutive failures
const CIRCUIT_FAILURE_WINDOW = 5 * 60 * 1000; // 5 minute failure window
const CIRCUIT_RESET_TIMEOUT = 30 * 1000; // 30 second cooldown before retry

function recordCircuitFailure() {
  const now = Date.now();
  // Reset counter if last failure was outside the window
  if (now - circuit.lastFailureTime > CIRCUIT_FAILURE_WINDOW) {
    circuit.failureCount = 0;
  }
  circuit.failureCount++;
  circuit.lastFailureTime = now;

  if (circuit.failureCount >= CIRCUIT_FAILURE_THRESHOLD) {
    circuit.isOpen = true;
    circuit.openedAt = now;
    console.warn(`TTS circuit breaker OPENED after ${circuit.failureCount} failures`);
  }
}

function recordCircuitSuccess() {
  circuit.failureCount = 0;
  circuit.isOpen = false;
}

function isCircuitOpen(): boolean {
  if (!circuit.isOpen) return false;
  // Auto-close after cooldown period (half-open: allow one request through)
  if (Date.now() - circuit.openedAt > CIRCUIT_RESET_TIMEOUT) {
    circuit.isOpen = false;
    circuit.failureCount = 0;
    console.info("TTS circuit breaker CLOSED (cooldown expired)");
    return false;
  }
  return true;
}

// ── In-flight Request Deduplication ─────────────────────────
// Prevents duplicate TTS synthesis for identical concurrent requests

const inFlight = new Map<string, Promise<Buffer>>();

function hashText(text: string, voice: string, rate?: string, pitch?: string): string {
  let hash = 0;
  const str = `${voice}:${rate ?? ""}:${pitch ?? ""}:${text}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Sanitize text before TTS processing.
 * When ssml=true, preserves SSML tags (break, emphasis, prosody, speak).
 * When ssml=false, strips all tags for plain text mode.
 */
function sanitizeText(text: string, preserveSSML: boolean = false): string {
  let cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars except \n \r \t
    .replace(/\s{3,}/g, " ") // collapse excessive whitespace
    .trim();

  if (!preserveSSML) {
    // Strip all XML/SSML/HTML tags in plain text mode
    cleaned = cleaned
      .replace(/<break[^>]*\/?>/gi, ", ")
      .replace(/<[^>]+>/g, "");
  }

  return cleaned;
}

function synthesizeTTS(
  text: string,
  voice: string,
  outputPath: string,
  rate: string,
  pitch: string,
  ssml: boolean = false
): Promise<void> {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(process.cwd(), "scripts", "tts-worker.js");

    // Write args to temp JSON file to avoid CLI argument escaping issues on Windows
    const argsData = { text, voice, outputPath, rate, pitch, ssml };
    const argsFilePath = path.join(
      os.tmpdir(),
      `tts-args-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`
    );

    try {
      fs.writeFileSync(argsFilePath, JSON.stringify(argsData), "utf-8");
    } catch (err) {
      reject(new Error(`Failed to write TTS args file: ${err}`));
      return;
    }

    execFile(
      "node",
      [workerPath, argsFilePath],
      { timeout: 20000 },
      (error, stdout, stderr) => {
        // Clean up args file (worker should have already deleted it, but just in case)
        try {
          if (fs.existsSync(argsFilePath)) fs.unlinkSync(argsFilePath);
        } catch { }

        if (error) {
          reject(
            new Error(
              `TTS worker failed: ${error.message}. stderr: ${stderr}`
            )
          );
        } else if (stdout.trim() === "OK") {
          resolve();
        } else {
          reject(
            new Error(
              `TTS worker unexpected output: ${stdout}. stderr: ${stderr}`
            )
          );
        }
      }
    );
  });
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = rateLimit(`tts:${ip}`, 20);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  try {
    // Robust JSON parsing with fallback
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch (jsonError) {
      // If standard JSON parse fails, try reading as text and sanitizing
      try {
        const rawText = await request.text();
        // Strip any control characters that may have slipped in
        const cleaned = rawText.replace(/[\x00-\x1F\x7F]/g, (ch) => {
          // Keep valid JSON whitespace: tab, newline, carriage return
          if (ch === "\t" || ch === "\n" || ch === "\r") return ch;
          return "";
        });
        body = JSON.parse(cleaned);
      } catch {
        console.error("TTS: Failed to parse request body:", jsonError);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    }

    const text = body.text as string | undefined;
    const voice = body.voice as string | undefined;
    const rate = body.rate as string | undefined;
    const pitch = body.pitch as string | undefined;
    const ssml = body.ssml as boolean | undefined;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Sanitize text for TTS (preserve SSML tags when in SSML mode)
    const hasSSMLTags = text.includes("<break") || text.includes("<emphasis") || text.includes("<prosody");
    const useSSML = ssml === true || hasSSMLTags;
    const cleanText = sanitizeText(text, useSSML);

    if (!cleanText) {
      return NextResponse.json(
        { error: "Text is empty after sanitization" },
        { status: 400 }
      );
    }

    if (cleanText.length > 2000) {
      return NextResponse.json(
        { error: "Text too long (max 2000 chars)" },
        { status: 400 }
      );
    }

    const selectedVoice = voice || "nl-NL-FennaNeural";
    const rateStr = (rate as string) || "default";
    const pitchStr = (pitch as string) || "default";
    const cacheKey = hashText(cleanText, selectedVoice, rateStr, pitchStr);

    // Check cache
    cleanCache();
    const cached = cache.get(cacheKey);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=1800",
          "X-Cache": "HIT",
        },
      });
    }

    // ── Circuit breaker check ──
    if (isCircuitOpen()) {
      return NextResponse.json(
        { error: "TTS_CIRCUIT_OPEN", message: "TTS service temporarily unavailable. Retrying shortly." },
        { status: 503, headers: { "Retry-After": "30" } }
      );
    }

    // ── Deduplication: check if this exact synthesis is already in progress ──
    const existingFlight = inFlight.get(cacheKey);
    if (existingFlight) {
      try {
        const audioBuffer = await existingFlight;
        return new NextResponse(new Uint8Array(audioBuffer), {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=1800",
            "X-Cache": "DEDUP",
          },
        });
      } catch {
        // In-flight request failed, fall through to try our own synthesis
      }
    }

    // Synthesize via worker subprocess
    const tmpFile = path.join(
      os.tmpdir(),
      `tts-${cacheKey}-${Date.now()}.mp3`
    );

    // Create a synthesis promise and register it for dedup
    const synthesisPromise = (async (): Promise<Buffer> => {
      await synthesizeTTS(
        cleanText,
        selectedVoice,
        tmpFile,
        rate || "default",
        pitch || "default",
        useSSML
      );
      const audioBuffer = fs.readFileSync(tmpFile);

      // Clean up temp file
      try { fs.unlinkSync(tmpFile); } catch { }

      if (audioBuffer.length === 0) {
        throw new Error("Empty audio output");
      }

      return audioBuffer;
    })();

    // Register in-flight for dedup
    inFlight.set(cacheKey, synthesisPromise);

    try {
      const audioBuffer = await synthesisPromise;

      // Record success for circuit breaker
      recordCircuitSuccess();

      // Store in cache
      cache.set(cacheKey, {
        buffer: audioBuffer,
        timestamp: Date.now(),
      });

      return new NextResponse(new Uint8Array(audioBuffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=1800",
          "X-Cache": "MISS",
        },
      });
    } catch (synthError) {
      // Record failure for circuit breaker
      recordCircuitFailure();

      // Clean up temp file on error
      try { fs.unlinkSync(tmpFile); } catch { }
      throw synthError;
    } finally {
      // Always clean up in-flight entry
      inFlight.delete(cacheKey);
    }
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      {
        error: "TTS_SYNTHESIS_FAILED",
        message: "Text-to-speech synthesis failed",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available Dutch voices
export async function GET() {
  const dutchVoices = [
    {
      ShortName: "nl-NL-FennaNeural",
      Gender: "Female",
      Locale: "nl-NL",
      FriendlyName: "Microsoft Fenna Online (Natural) - Dutch (Netherlands)",
    },
    {
      ShortName: "nl-NL-ColetteNeural",
      Gender: "Female",
      Locale: "nl-NL",
      FriendlyName: "Microsoft Colette Online (Natural) - Dutch (Netherlands)",
    },
    {
      ShortName: "nl-NL-MaartenNeural",
      Gender: "Male",
      Locale: "nl-NL",
      FriendlyName: "Microsoft Maarten Online (Natural) - Dutch (Netherlands)",
    },
    {
      ShortName: "nl-BE-ArnaudNeural",
      Gender: "Male",
      Locale: "nl-BE",
      FriendlyName: "Microsoft Arnaud Online (Natural) - Dutch (Belgium)",
    },
    {
      ShortName: "nl-BE-DenaNeural",
      Gender: "Female",
      Locale: "nl-BE",
      FriendlyName: "Microsoft Dena Online (Natural) - Dutch (Belgium)",
    },
  ];

  return NextResponse.json(dutchVoices);
}
