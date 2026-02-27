"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms`);
    }

    // Send to analytics endpoint in production
    if (process.env.NODE_ENV === "production") {
      const body = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      };

      // Use sendBeacon for reliable delivery (Endpoint removed to prevent 405s)
      /* if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", JSON.stringify(body));
      } */
    }
  });

  return null;
}
