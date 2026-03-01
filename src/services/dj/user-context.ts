// ═══════════════════════════════════════════════════════════════
//  USER CONTEXT — Builds personalized context for DJ announcements
// ═══════════════════════════════════════════════════════════════

const VISIT_COUNT_KEY = "sr_visit_count";
const LAST_VISIT_KEY = "sr_last_visit";

export interface UserDJContext {
  name?: string;
  topArtists?: string[];
  topGenres?: string[];
  visitCount: number;
  isReturningUser: boolean;
}

/**
 * Load and increment the visit counter from localStorage.
 * A "visit" is counted once per browser session (tab open).
 */
let visitRecordedThisSession = false;

function getAndIncrementVisitCount(): { visitCount: number; isReturningUser: boolean } {
  if (typeof window === "undefined") return { visitCount: 1, isReturningUser: false };

  try {
    const stored = localStorage.getItem(VISIT_COUNT_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const isReturning = count > 0 && !!lastVisit;

    if (!visitRecordedThisSession) {
      visitRecordedThisSession = true;
      localStorage.setItem(VISIT_COUNT_KEY, String(count + 1));
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    }

    return { visitCount: count + 1, isReturningUser: isReturning };
  } catch {
    return { visitCount: 1, isReturningUser: false };
  }
}

/**
 * Extract top artists from the taste profile stored in localStorage.
 */
function getTopArtistsFromTaste(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("spotify-radio-taste");
    if (!stored) return [];
    const profile = JSON.parse(stored);
    // likedArtistIds contains Spotify artist IDs — we need names
    // Fall back to likedArtistNames if available
    if (profile.likedArtistNames && Array.isArray(profile.likedArtistNames)) {
      return profile.likedArtistNames.slice(0, 5);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Build user context for DJ script personalization.
 * Call this when generating DJ scripts to inject personal touches.
 */
export function buildUserContext(userName?: string | null): UserDJContext {
  const { visitCount, isReturningUser } = getAndIncrementVisitCount();
  const topArtists = getTopArtistsFromTaste();

  return {
    name: userName || undefined,
    topArtists: topArtists.length > 0 ? topArtists : undefined,
    visitCount,
    isReturningUser,
  };
}
