// Standalone TTS worker script - called by API route via child_process
// Usage: node scripts/tts-worker.js <args-file-path>
// args-file-path: path to a JSON file containing { text, voice, outputPath, rate, pitch }

const fs = require("fs");
const { EdgeTTS } = require("node-edge-tts");

async function main() {
  const argsFilePath = process.argv[2];

  if (!argsFilePath) {
    throw new Error("No args file path provided");
  }

  // Read args from temp JSON file (avoids CLI argument escaping issues on Windows)
  const raw = fs.readFileSync(argsFilePath, "utf-8");
  const args = JSON.parse(raw);
  const { text, voice, outputPath, rate, pitch } = args;

  // Clean up the args file immediately
  try {
    fs.unlinkSync(argsFilePath);
  } catch {}

  // Sanitize text: strip control characters that could break TTS
  const cleanText = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars (keep \n \r \t)
    .replace(/\\/g, "") // strip stray backslashes
    .trim();

  if (!cleanText) {
    throw new Error("Empty text after sanitization");
  }

  const tts = new EdgeTTS({
    voice: voice || "nl-NL-FennaNeural",
    lang: (voice || "nl-NL-FennaNeural").split("-").slice(0, 2).join("-"),
    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    rate: rate || "default",
    pitch: pitch || "default",
    timeout: 15000,
  });

  await tts.ttsPromise(cleanText, outputPath);
  console.log("OK");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
