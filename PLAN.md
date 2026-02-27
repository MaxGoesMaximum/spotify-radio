# Spotify Radio App - Implementation Plan

## Overview
A browser-based radio station app that connects to Spotify for music, features AI-powered DJ announcements, live weather reports, local news, and a stunning retro-meets-neon UI.

## Tech Stack
- **React 18 + Vite + TypeScript**
- **Spotify Web API** (PKCE auth flow for SPA)
- **Spotify Web Playback SDK** (in-browser playback, requires Premium)
- **Web Speech API** (SpeechSynthesis for DJ announcements)
- **OpenWeatherMap API** (free tier for weather)
- **GNews API / RSS** (local news headlines)
- **Web Audio API + Canvas** (audio visualizer)
- **Pure CSS** (glassmorphism, neon glow, animations)

## Key Features

### 1. Setup Wizard (First Launch)
- Step-by-step guide to register a Spotify Developer app
- Input fields for Client ID
- Input for Weather API key (OpenWeatherMap)
- Location setup (geolocation or manual city)
- All stored in localStorage

### 2. Genre Picker (Session Start)
- Beautiful card grid with genre options
- Genres: Pop, Rock, Jazz, Lo-Fi, Hip-Hop, Electronic, Indie, Classical, R&B, Ambient, Latin, Country
- Each card has unique gradient/icon
- Select one or mix multiple for variety
- "Surprise Me" random option

### 3. Radio Flow Engine
The core loop that makes it feel like real radio:
```
[Jingle] → [Song 1] → [DJ: "That was X by Y..."] → [Song 2] → [Song 3]
→ [DJ + Weather Report] → [Song 4] → [Song 5] → [News Headlines] → [Jingle] → repeat
```
- Every 2-3 songs: short DJ commentary
- Every 5-6 songs: weather update
- Every 8-10 songs: news segment
- Random jingle clips between segments

### 4. DJ Announcer System
- Browser TTS for dynamic content (song intros, weather, news)
- Pre-generated jingle sounds (we'll create simple ones with Web Audio API)
- Fun DJ phrases: "You're listening to [Station Name]!", "Coming up next...", etc.
- Different voices/tones for different segments

### 5. Weather Widget
- Current conditions + temperature
- Spoken as: "Currently 15 degrees and partly cloudy in Amsterdam..."
- Beautiful animated weather icon
- Auto-refreshes every 30 minutes

### 6. News Widget
- Top 3-5 local headlines
- Read aloud during news segments
- Scrolling ticker at bottom of screen
- Links to full articles

### 7. UI Design (Retro Radio meets Neon Cyberpunk)
- **Dark background** with subtle gradient
- **Glassmorphism panels** with frosted glass effect
- **Neon accent colors** (cyan, magenta, amber glow)
- **Spinning vinyl record** with actual album art in center
- **Audio equalizer bars** animated to music
- **Retro radio dial** for genre switching
- **Glowing controls** (play/pause, skip, volume)
- **Station name banner** with LED-style text
- **News ticker** scrolling at bottom
- **Weather card** with animated icons
- **Particle effects** in background

## File Structure
```
src/
├── main.tsx
├── App.tsx
├── App.css
├── types.ts
├── components/
│   ├── SetupWizard/
│   ├── GenrePicker/
│   ├── RadioStation/
│   ├── NowPlaying/
│   ├── VinylRecord/
│   ├── Equalizer/
│   ├── Controls/
│   ├── WeatherWidget/
│   ├── NewsWidget/
│   ├── NewsTicker/
│   ├── DJOverlay/
│   └── ParticleBackground/
├── services/
│   ├── spotify.ts
│   ├── weather.ts
│   ├── news.ts
│   ├── announcer.ts
│   └── radioEngine.ts
├── hooks/
│   ├── useSpotify.ts
│   ├── useRadioEngine.ts
│   └── useLocation.ts
└── utils/
    ├── storage.ts
    ├── genres.ts
    └── djPhrases.ts
```

## Build Phases
1. **Phase 1**: Project setup, Spotify auth, basic playback
2. **Phase 2**: Genre picker + random track selection
3. **Phase 3**: Radio engine (song queue + announcer interlacing)
4. **Phase 4**: Weather + News integration
5. **Phase 5**: Full UI (vinyl, equalizer, particles, glassmorphism)
6. **Phase 6**: Polish, transitions, responsive design
