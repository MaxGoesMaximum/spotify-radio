// Script to push schema to Turso database
// Run with: npx tsx scripts/setup-turso.ts

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment");
    process.exit(1);
}

const client = createClient({ url, authToken });

const TABLES = [
    `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "spotifyId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
    `CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
    `CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`,
    `CREATE TABLE IF NOT EXISTS "ListeningHistory" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "albumName" TEXT NOT NULL,
    "albumImage" TEXT,
    "genre" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
    `CREATE INDEX IF NOT EXISTS "ListeningHistory_userId_playedAt_idx" ON "ListeningHistory"("userId", "playedAt")`,
    `CREATE INDEX IF NOT EXISTS "ListeningHistory_userId_genre_idx" ON "ListeningHistory"("userId", "genre")`,
    `CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "albumName" TEXT NOT NULL,
    "albumImage" TEXT,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_trackId_key" ON "Favorite"("userId", "trackId")`,
    `CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId")`,
    `CREATE TABLE IF NOT EXISTS "UserPreferences" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "volume" REAL NOT NULL DEFAULT 0.7,
    "lastStation" TEXT NOT NULL DEFAULT 'pop',
    "djVoice" TEXT NOT NULL DEFAULT 'nl-NL-FennaNeural',
    "notificationsEnabled" INTEGER NOT NULL DEFAULT 0,
    "djFrequency" TEXT NOT NULL DEFAULT 'normal',
    "crossfade" INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
];

async function main() {
    console.log("🚀 Pushing schema to Turso...\n");

    for (const sql of TABLES) {
        const tableName = sql.match(/"(\w+)"/)?.[1] || "index";
        try {
            await client.execute(sql);
            console.log(`  ✅ ${tableName}`);
        } catch (err) {
            console.error(`  ❌ ${tableName}:`, (err as Error).message);
        }
    }

    console.log("\n✨ Done! All tables created in Turso.");
}

main().catch(console.error);
