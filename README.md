# Spotify Radio

A browser-based radio experience powered by Spotify. Features 10 curated FM stations, an AI DJ with text-to-speech announcements, live weather and news integration, and a retro-meets-modern UI.

## Features

- **10 FM Stations** — Pop, Rock, R&B, Jazz, Hip-Hop, Dutch, Classics, Indie, Dance, Chill
- **AI DJ Announcer** — Text-to-speech DJ with 3 voice options, weather reports, and news
- **Audio Visualizer** — 3 styles (bars, wave, circular) synced to playback
- **Smart Rotation** — Intelligent track selection with current/recurrent/gold weighting
- **Listening Stats** — Genre breakdown, top artists, streaks, and heatmaps
- **Song Reactions** — React with emojis to tracks
- **Sleep Timer** — Configurable timer with gradual volume fade-out
- **Themes** — 5 themes (Dark, Midnight, Light, Sunset, Ocean) + per-station colors
- **i18n** — Dutch, English, and German
- **PWA** — Installable on mobile and desktop with offline support
- **GDPR Compliant** — Data export, account deletion, cookie consent
- **Keyboard Shortcuts** — Full keyboard control (Space, N, arrows, M, F, ?)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.9 (strict) |
| State | Zustand |
| Database | SQLite (dev) / Turso (prod) |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Spotify OAuth) |
| Styling | Tailwind CSS + Framer Motion |
| TTS | node-edge-tts |
| Validation | Zod |
| Testing | Jest + React Testing Library + Playwright |

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Spotify Premium** account
- API keys for [OpenWeatherMap](https://openweathermap.org/api) and [GNews](https://gnews.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/spotify-radio.git
cd spotify-radio

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### Spotify App Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://127.0.0.1:3000/api/spotify/callback` as a redirect URI
4. Copy the Client ID and Client Secret to `.env.local`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |

## Project Structure

```
src/
  app/           # Next.js pages and API routes
  components/    # React components (radio/, ui/, stats/)
  hooks/         # Custom React hooks
  store/         # Zustand state management
  lib/           # Utilities (db, validation, i18n, rate-limit)
  services/      # Business logic (Spotify API, DJ, audio)
  config/        # Station definitions, themes, i18n locales
  types/         # TypeScript type definitions
e2e/             # Playwright E2E tests
prisma/          # Database schema
public/          # Static assets, PWA manifest, service worker
```

## Deployment

### Vercel + Turso

1. Create a [Turso](https://turso.tech/) database
2. Add environment variables to Vercel project settings
3. Deploy from GitHub — the CI pipeline runs lint, test, and build automatically

### Environment Variables

See [.env.example](.env.example) for the full list of required and optional variables.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[MIT](LICENSE)
