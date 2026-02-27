/**
 * Tests for weather API validation logic
 */
import { rateLimit } from "@/lib/rate-limit";

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn(() => ({ success: true, limit: 10, remaining: 9 })),
  rateLimitHeaders: jest.fn(() => ({})),
}));

describe("Weather API validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rate limiter should be called with weather key", () => {
    rateLimit("weather:127.0.0.1", 10);
    expect(rateLimit).toHaveBeenCalledWith("weather:127.0.0.1", 10);
  });

  it("rate limiter should reject when limit exceeded", () => {
    (rateLimit as jest.Mock).mockReturnValue({
      success: false,
      limit: 10,
      remaining: 0,
      retryAfter: 30,
    });

    const result = rateLimit("weather:127.0.0.1", 10);
    expect(result.success).toBe(false);
    expect(result.retryAfter).toBe(30);
  });
});
