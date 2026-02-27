"use client";

import { useRadioStore } from "@/store/radio-store";
import { useEffect, useState } from "react";
import { getStationColor } from "@/config/stations";

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SongProgressBar() {
    const progress = useRadioStore((s) => s.progress);
    const duration = useRadioStore((s) => s.duration);
    const isPlaying = useRadioStore((s) => s.isPlaying);
    const currentGenre = useRadioStore((s) => s.currentGenre);
    const [displayProgress, setDisplayProgress] = useState(progress);

    const genreColor = getStationColor(currentGenre);

    // Smoothly interpolate progress when playing
    useEffect(() => {
        setDisplayProgress(progress);
    }, [progress]);

    useEffect(() => {
        if (!isPlaying || duration === 0) return;
        const interval = setInterval(() => {
            setDisplayProgress((prev) => Math.min(prev + 250, duration));
        }, 250);
        return () => clearInterval(interval);
    }, [isPlaying, duration]);

    const percent = duration > 0 ? (displayProgress / duration) * 100 : 0;

    return (
        <div className="w-full space-y-1.5 mt-3">
            {/* Progress bar track */}
            <div className="relative h-1 w-full bg-white/[0.06] rounded-full overflow-hidden group cursor-pointer">
                {/* Filled portion */}
                <div
                    className="h-full rounded-full transition-all duration-200 ease-linear"
                    style={{
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${genreColor}80, ${genreColor})`,
                        boxShadow: `0 0 8px ${genreColor}40`,
                    }}
                />
                {/* Hover knob */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{
                        left: `${percent}%`,
                        transform: `translate(-50%, -50%)`,
                        background: genreColor,
                        boxShadow: `0 0 6px ${genreColor}60`,
                    }}
                />
            </div>
            {/* Time labels */}
            <div className="flex justify-between text-[10px] text-white/25 tabular-nums font-medium px-0.5">
                <span>{formatTime(displayProgress)}</span>
                <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
            </div>
        </div>
    );
}
