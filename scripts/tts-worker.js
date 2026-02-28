// Standalone TTS worker script - called by API route via child_process
// Usage: node scripts/tts-worker.js <args-file-path>
// args-file-path: path to a JSON file containing { text, voice, outputPath, rate, pitch, ssml? }

const fs = require("fs");
const { EdgeTTS } = require("node-edge-tts");

/**
 * Wrap plain text in SSML <speak> envelope with prosody controls.
 * Converts punctuation-based pauses into explicit SSML breaks for natural rhythm.
 */
function buildSSML(text, voice, rate, pitch) {
  const lang = (voice || "nl-NL-FennaNeural").split("-").slice(0, 2).join("-");

  // Build prosody attributes
  const prosodyAttrs = [];
  if (rate && rate !== "default") prosodyAttrs.push(`rate="${rate}"`);
  if (pitch && pitch !== "default") prosodyAttrs.push(`pitch="${pitch}"`);
  const prosodyOpen = prosodyAttrs.length > 0
    ? `<prosody ${prosodyAttrs.join(" ")}>`
    : "";
  const prosodyClose = prosodyAttrs.length > 0 ? "</prosody>" : "";

  // Process text: add natural breaks at sentence boundaries
  let processed = text
    // Add medium break after sentence-ending punctuation (. ! ?)
    .replace(/([.!?])\s+/g, '$1<break time="350ms"/> ')
    // Add short break after commas for natural pacing
    .replace(/,\s+/g, ',<break time="150ms"/> ')
    // Add subtle break after ellipsis for dramatic pause
    .replace(/\.\.\.\s*/g, '...<break time="500ms"/> ')
    // Add break after colons
    .replace(/:\s+/g, ':<break time="200ms"/> ');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">${prosodyOpen}${processed}${prosodyClose}</speak>`;
}

async function main() {
  const argsFilePath = process.argv[2];

  if (!argsFilePath) {
    throw new Error("No args file path provided");
  }

  // Read args from temp JSON file (avoids CLI argument escaping issues on Windows)
  const raw = fs.readFileSync(argsFilePath, "utf-8");
  const args = JSON.parse(raw);
  const { text, voice, outputPath, rate, pitch, ssml } = args;

  // Clean up the args file immediately
  try {
    fs.unlinkSync(argsFilePath);
  } catch { }

  // Sanitize text: strip control characters that could break TTS
  let cleanText = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars (keep \n \r \t)
    .replace(/\\/g, "") // strip stray backslashes
    .trim();

  if (!cleanText) {
    throw new Error("Empty text after sanitization");
  }

  const selectedVoice = voice || "nl-NL-FennaNeural";

  // If SSML mode is on OR the text already contains SSML tags, use SSML synthesis
  const useSSML = ssml === true || cleanText.includes("<break") || cleanText.includes("<emphasis");

  let synthesisText;
  if (useSSML) {
    // If text already has a <speak> envelope, use as-is; otherwise wrap it
    if (cleanText.startsWith("<speak")) {
      synthesisText = cleanText;
    } else {
      synthesisText = buildSSML(cleanText, selectedVoice, rate, pitch);
    }
  } else {
    // Plain text mode — still wrap in SSML for natural prosody
    synthesisText = buildSSML(cleanText, selectedVoice, rate, pitch);
  }

  const tts = new EdgeTTS({
    voice: selectedVoice,
    lang: selectedVoice.split("-").slice(0, 2).join("-"),
    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    // When using SSML, rate/pitch are inside the SSML envelope
    rate: "default",
    pitch: "default",
    timeout: 15000,
  });

  await tts.ttsPromise(synthesisText, outputPath);
  console.log("OK");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
