/**
 * Environment variable validation.
 * Validates required env vars at startup to fail fast.
 */

const requiredServerVars = [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
] as const;

const optionalServerVars = [
  "NEXTAUTH_URL",
  "OPENWEATHERMAP_API_KEY",
  "GNEWS_API_KEY",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_BASE_URL",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredServerVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nSee .env.example for reference.`
    );
  }

  // Warn about weak NEXTAUTH_SECRET
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length < 32) {
    console.warn(
      "[env] NEXTAUTH_SECRET is shorter than 32 characters. Generate a strong secret: openssl rand -base64 32"
    );
  }
}

export const env = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://127.0.0.1:3000",
  OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  GNEWS_API_KEY: process.env.GNEWS_API_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
