"use client";

import { useEffect, useState } from "react";

export function TimeDisplay() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setSeconds(now.getSeconds().toString().padStart(2, "0"));
      setDate(
        now.toLocaleDateString("nl-NL", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center select-none">
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-white/90 tracking-wider tabular-nums">
          {time}
        </span>
        <span className="text-xs font-mono text-white/15 tabular-nums w-5">
          {seconds}
        </span>
      </div>
      <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-0.5">
        {date}
      </div>
    </div>
  );
}
