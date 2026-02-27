"use client";

import { motion } from "framer-motion";

/**
 * Peak Listening Hours Heatmap
 * Shows a 7-day × 24-hour heatmap of listening activity
 */

interface HeatmapProps {
    data?: Record<string, number>; // "day-hour" -> count, e.g. "1-14" = Monday 14:00
}

const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ListeningHeatmap({ data }: HeatmapProps) {
    // Generate mock data if none provided (will be replaced with real API data)
    const heatData = data || generateMockData();
    const maxVal = Math.max(1, ...Object.values(heatData));

    const getColor = (value: number): string => {
        if (value === 0) return "rgba(255,255,255,0.02)";
        const intensity = value / maxVal;
        if (intensity < 0.25) return "rgba(10,132,255,0.15)";
        if (intensity < 0.5) return "rgba(10,132,255,0.35)";
        if (intensity < 0.75) return "rgba(10,132,255,0.6)";
        return "rgba(10,132,255,0.9)";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.06] p-6 bg-[#111113]"
        >
            <h3 className="text-white/80 text-sm font-semibold mb-5 uppercase tracking-wider">
                📊 Piekuren
            </h3>

            <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                    {/* Hour labels */}
                    <div className="flex mb-1 ml-8">
                        {HOURS.filter((h) => h % 3 === 0).map((h) => (
                            <span
                                key={h}
                                className="text-[9px] text-white/20 font-mono"
                                style={{ width: `${(3 / 24) * 100}%` }}
                            >
                                {h.toString().padStart(2, "0")}
                            </span>
                        ))}
                    </div>

                    {/* Grid */}
                    {DAYS.map((day, dayIdx) => (
                        <div key={day} className="flex items-center gap-1 mb-[2px]">
                            <span className="text-[10px] text-white/30 w-7 text-right font-medium shrink-0">
                                {day}
                            </span>
                            <div className="flex flex-1 gap-[1px]">
                                {HOURS.map((hour) => {
                                    const key = `${dayIdx}-${hour}`;
                                    const value = heatData[key] || 0;
                                    return (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: (dayIdx * 24 + hour) * 0.002 }}
                                            className="flex-1 h-5 rounded-[3px] transition-colors cursor-default"
                                            style={{ backgroundColor: getColor(value) }}
                                            title={`${day} ${hour}:00 — ${value} tracks`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-1 mt-3">
                        <span className="text-[9px] text-white/20">Minder</span>
                        {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
                            <div
                                key={intensity}
                                className="w-3 h-3 rounded-[2px]"
                                style={{
                                    backgroundColor: intensity === 0
                                        ? "rgba(255,255,255,0.02)"
                                        : `rgba(10,132,255,${intensity * 0.9})`,
                                }}
                            />
                        ))}
                        <span className="text-[9px] text-white/20">Meer</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function generateMockData(): Record<string, number> {
    const data: Record<string, number> = {};
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            // More activity in evenings and weekends
            const isEvening = h >= 18 && h <= 23;
            const isWeekend = d >= 5;
            const isMorning = h >= 7 && h <= 9;
            let base = Math.random() * 3;
            if (isEvening) base += 5;
            if (isWeekend) base += 3;
            if (isMorning) base += 2;
            if (h >= 1 && h <= 6) base = Math.random() * 0.5; // Almost nothing at night
            data[`${d}-${h}`] = Math.round(base);
        }
    }
    return data;
}
