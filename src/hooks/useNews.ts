"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRadioStore } from "@/store/radio-store";

export function useNews() {
  const weather = useRadioStore((s) => s.weather);
  const news = useRadioStore((s) => s.news);
  const setNews = useRadioStore((s) => s.setNews);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const activeRequest = useRef<Promise<void> | null>(null);

  const fetchNews = useCallback(async () => {
    // Cache for 30 minutes (1800000ms)
    const now = Date.now();
    const newsLastUpdated = useRadioStore.getState().newsLastUpdated;
    if (newsLastUpdated && now - newsLastUpdated < 30 * 60 * 1000) {
      return;
    }

    if (activeRequest.current) return activeRequest.current;

    setIsLoading(true);
    setError(null);

    const request = (async () => {
      try {
        const city = weather?.city || "Netherlands";
        const res = await fetch(`/api/news?city=${encodeURIComponent(city)}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.articles || []);
          setError(null);
        } else {
          setError(`News API returned ${res.status}`);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Failed to fetch news");
      } finally {
        activeRequest.current = null;
        setIsLoading(false);
      }
    })();

    activeRequest.current = request;
    return request;
  }, [weather?.city, setNews]);

  useEffect(() => {
    fetchNews();
    // Refresh every hour
    const interval = setInterval(fetchNews, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { news, error, isLoading, refetch: fetchNews };
}
