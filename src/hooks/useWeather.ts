"use client";

import { useEffect, useCallback, useState } from "react";
import { useRadioStore } from "@/store/radio-store";

export function useWeather() {
  const location = useRadioStore((s) => s.location);
  const weather = useRadioStore((s) => s.weather);
  const setWeather = useRadioStore((s) => s.setWeather);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = useCallback(async () => {
    if (!location) return;

    // Cache for 15 minutes (900000ms)
    const now = Date.now();
    const weatherLastUpdated = useRadioStore.getState().weatherLastUpdated;
    if (weatherLastUpdated && now - weatherLastUpdated < 15 * 60 * 1000) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/weather?lat=${location.lat}&lon=${location.lon}`
      );
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        setError(null);
      } else {
        setError(`Weather API returned ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to fetch weather:", err);
      setError("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  }, [location, setWeather]);

  useEffect(() => {
    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, error, isLoading, refetch: fetchWeather };
}
