/** @type {import('next').NextConfig} */
const nextConfig = {
  // node-edge-tts uses ws, fs, crypto - must be treated as external in server
  experimental: {
    serverComponentsExternalPackages: ["node-edge-tts"],
  },
  // Skip ESLint during production build (non-critical warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Compress responses for faster loading
  compress: true,
  // Enable production source maps for debugging
  productionBrowserSourceMaps: false,
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    // Allow https: so the Service Worker can fetch() caching proxy images
    const connectSrc = isDev
      ? "'self' https: wss://dealer.spotify.com ws://localhost:*"
      : "'self' https: wss://dealer.spotify.com";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Spotify SDK requires unsafe-eval; Next.js/Framer Motion need unsafe-inline
              // TODO: migrate to nonce-based CSP when Next.js adds full support
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.scdn.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              `connect-src ${connectSrc}`,
              "frame-src 'self' https://sdk.scdn.co",
              "media-src 'self' blob: data:",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          }
        ],
      },
      // Cache static assets aggressively
      {
        source: "/(.*)\\.(js|css|woff2|png|jpg|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // EXCEPT for Service Worker itself (must never be cached or headers get stuck)
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
