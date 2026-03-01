// Service Worker for Spotify Radio PWA
// Versioned caching with strategy-based fetching

const CACHE_VERSION = "v4";
const STATIC_CACHE = `spotify-radio-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `spotify-radio-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
];

const CACHEABLE_EXTENSIONS = /\.(js|css|woff2|png|jpg|jpeg|svg|ico|webp)$/;

// Install — pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
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
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — strategy-based caching
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // API calls — network only
  if (url.pathname.startsWith("/api/")) return;

  // Spotify SDK — network only
  if (url.hostname === "sdk.scdn.co") return;

  // Spotify CDN images — stale-while-revalidate
  if (url.hostname.endsWith(".scdn.co") || url.hostname.endsWith(".spotifycdn.com")) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Static assets — cache-first
  if (CACHEABLE_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Navigation & other — network-first
  event.respondWith(networkFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      const fallback = await caches.match("/");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}
