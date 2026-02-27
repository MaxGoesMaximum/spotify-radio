import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function getTimeGradient(): string {
  const tod = getTimeOfDay();
  switch (tod) {
    case "morning":
      return "from-amber-900/30 via-orange-900/20 to-yellow-900/10";
    case "afternoon":
      return "from-blue-900/30 via-cyan-900/20 to-sky-900/10";
    case "evening":
      return "from-purple-900/40 via-pink-900/20 to-orange-900/10";
    case "night":
      return "from-slate-950 via-indigo-950/50 to-slate-950";
  }
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getGreeting(): string {
  const tod = getTimeOfDay();
  switch (tod) {
    case "morning":
      return "Goedemorgen";
    case "afternoon":
      return "Goedemiddag";
    case "evening":
      return "Goedenavond";
    case "night":
      return "Goedenacht";
  }
}
