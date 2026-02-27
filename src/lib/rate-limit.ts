/**
 * In-memory sliding window rate limiter.
 * Tracks request timestamps per key (IP) and enforces limits.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number; // seconds
}

/**
 * Check if a request is allowed under rate limiting.
 * @param key - Unique identifier (e.g., IP + route)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfter,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - entry.timestamps.length,
  };
}

/**
 * Get rate limit headers for the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }
  return headers;
}
