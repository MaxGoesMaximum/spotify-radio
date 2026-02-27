// ═══════════════════════════════════════════════════════════════
//  SHARE CARD — Canvas-generated "Now Playing" images
// ═══════════════════════════════════════════════════════════════

import type { SpotifyTrack } from "@/types";
import { getStation, type StationId } from "@/config/stations";

interface ShareCardOptions {
  track: SpotifyTrack;
  stationId: StationId;
  width?: number;
  height?: number;
}

/**
 * Generate a "Now Playing" share card as a canvas-rendered blob
 * Returns a Blob URL suitable for sharing or downloading
 */
export async function generateShareCard(options: ShareCardOptions): Promise<string> {
  const { track, stationId, width = 1080, height = 1080 } = options;
  const station = getStation(stationId);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // ── Background gradient ──
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0a0a1a");
  gradient.addColorStop(0.5, station.color + "30");
  gradient.addColorStop(1, "#0a0a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // ── Album art ──
  const albumUrl = track.album?.images?.[0]?.url;
  if (albumUrl) {
    try {
      const img = await loadImage(albumUrl);
      // Centered, with rounded corners effect via clipping
      const artSize = 480;
      const artX = (width - artSize) / 2;
      const artY = 140;
      const radius = 24;

      ctx.save();
      roundedRect(ctx, artX, artY, artSize, artSize, radius);
      ctx.clip();
      ctx.drawImage(img, artX, artY, artSize, artSize);
      ctx.restore();

      // Shadow around album art
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      roundedRect(ctx, artX, artY, artSize, artSize, radius);
      ctx.stroke();
    } catch {
      // Draw placeholder if image fails
      const artSize = 480;
      const artX = (width - artSize) / 2;
      const artY = 140;
      ctx.fillStyle = station.color + "30";
      roundedRect(ctx, artX, artY, artSize, artSize, 24);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 80px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SR", width / 2, artY + artSize / 2 + 30);
    }
  }

  // ── Track name ──
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  const trackName = truncateText(ctx, track.name, width - 120);
  ctx.fillText(trackName, width / 2, 700);

  // ── Artist name ──
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "300 32px sans-serif";
  const artistText = track.artists.map((a) => a.name).join(", ");
  const truncatedArtist = truncateText(ctx, artistText, width - 120);
  ctx.fillText(truncatedArtist, width / 2, 752);

  // ── Album name ──
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "300 24px sans-serif";
  const albumName = truncateText(ctx, track.album.name, width - 120);
  ctx.fillText(albumName, width / 2, 796);

  // ── Station branding ──
  ctx.fillStyle = station.color;
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(`${station.icon} ${station.label}`, width / 2, 880);

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "300 18px sans-serif";
  ctx.fillText(station.frequency + " MHz", width / 2, 912);

  // ── Bottom watermark ──
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "300 16px sans-serif";
  ctx.fillText("Spotify Radio", width / 2, height - 40);

  // ── Station color accent line ──
  const lineGradient = ctx.createLinearGradient(200, 0, width - 200, 0);
  lineGradient.addColorStop(0, "transparent");
  lineGradient.addColorStop(0.5, station.color + "80");
  lineGradient.addColorStop(1, "transparent");
  ctx.fillStyle = lineGradient;
  ctx.fillRect(200, 840, width - 400, 2);

  // Convert to blob URL
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        resolve("");
      }
    }, "image/png");
  });
}

// ── Helpers ──

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
}
