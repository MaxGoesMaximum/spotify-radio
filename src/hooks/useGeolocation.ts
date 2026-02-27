"use client";

import { useEffect } from "react";
import { useRadioStore } from "@/store/radio-store";

export function useGeolocation() {
  const setLocation = useRadioStore((s) => s.setLocation);
  const location = useRadioStore((s) => s.location);

  useEffect(() => {
    if (location) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        // Default to Amsterdam if geolocation denied
        setLocation({ lat: 52.3676, lon: 4.9041 });
      }
    );
  }, [location, setLocation]);

  return location;
}
