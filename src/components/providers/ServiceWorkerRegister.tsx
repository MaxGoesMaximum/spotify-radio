"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Mounts in layout to register the PWA service worker
 */
export function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((registration) => {
                        console.log("SW registered:", registration.scope);
                    })
                    .catch((error) => {
                        console.error("SW registration failed:", error);
                    });
            });
        }
    }, []);

    return null;
}
