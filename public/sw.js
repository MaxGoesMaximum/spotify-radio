// Service Worker for Spotify Radio PWA
// Provides offline caching for static assets

const CACHE_NAME = "spotify-radio-v1";
const STATIC_ASSETS = [
    "/",
    "/radio",
    "/explore",
    "/stats",
    "/social",
    "/profile",
    "/manifest.json",
    "/icon.svg",
];

// Install — pre-cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== "GET") return;

    // API calls — network only (don't cache dynamic data)
    if (url.pathname.startsWith("/api/")) return;

    // Spotify SDK — network only
    if (url.hostname === "sdk.scdn.co") return;

    // Static assets — cache-first
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                // Only cache successful responses
                if (!response || response.status !== 200) return response;

                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });

                return response;
            }).catch(() => {
                // Offline fallback for navigation
                if (event.request.mode === "navigate") {
                    return caches.match("/");
                }
                return new Response("Offline", { status: 503 });
            });
        })
    );
});
