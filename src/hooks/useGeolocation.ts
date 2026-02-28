"use client";

import { useEffect } from "react";
import { useRadioStore } from "@/store/radio-store";

export function useGeolocation() {
  const setLocation = useRadioStore((s) => s.setLocation);
  const location = useRadioStore((s) => s.location);

  useEffect(() => {
    if (location) return;
    if (!navigator.geolocation) {
      // No geolocation support — default to Amsterdam
      setLocation({ lat: 52.3676, lon: 4.9041 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        // Default to Amsterdam if geolocation denied
        setLocation({ lat: 52.3676, lon: 4.9041 });
      },
      { timeout: 10000, maximumAge: 300000 } // 10s timeout, 5min cache
    );
  }, [location, setLocation]);

  return location;
}
