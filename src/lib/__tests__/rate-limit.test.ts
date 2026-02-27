import { rateLimit, rateLimitHeaders } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const key = "test-allow-" + Date.now();
    const result = rateLimit(key, 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("blocks requests over the limit", () => {
    const key = "test-block-" + Date.now();
    // Use up all 3 allowed requests
    rateLimit(key, 3, 60000);
    rateLimit(key, 3, 60000);
    rateLimit(key, 3, 60000);

    // 4th should be blocked
    const result = rateLimit(key, 3, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks remaining correctly", () => {
    const key = "test-remaining-" + Date.now();
    const r1 = rateLimit(key, 5, 60000);
    expect(r1.remaining).toBe(4);

    const r2 = rateLimit(key, 5, 60000);
    expect(r2.remaining).toBe(3);

    const r3 = rateLimit(key, 5, 60000);
    expect(r3.remaining).toBe(2);
  });

  it("uses separate counters for different keys", () => {
    const key1 = "test-key1-" + Date.now();
    const key2 = "test-key2-" + Date.now();

    rateLimit(key1, 2, 60000);
    rateLimit(key1, 2, 60000);

    // key1 is exhausted
    const r1 = rateLimit(key1, 2, 60000);
    expect(r1.success).toBe(false);

    // key2 should still be available
    const r2 = rateLimit(key2, 2, 60000);
    expect(r2.success).toBe(true);
  });
});

describe("rateLimitHeaders", () => {
  it("returns correct headers for successful request", () => {
    const headers = rateLimitHeaders({
      success: true,
      limit: 10,
      remaining: 9,
    });
    expect(headers["X-RateLimit-Limit"]).toBe("10");
    expect(headers["X-RateLimit-Remaining"]).toBe("9");
    expect(headers["Retry-After"]).toBeUndefined();
  });

  it("includes Retry-After for blocked request", () => {
    const headers = rateLimitHeaders({
      success: false,
      limit: 10,
      remaining: 0,
      retryAfter: 30,
    });
    expect(headers["Retry-After"]).toBe("30");
  });
});
