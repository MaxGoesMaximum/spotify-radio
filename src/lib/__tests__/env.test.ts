/**
 * Tests for environment variable validation
 */

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should throw when required env vars are missing", () => {
    delete process.env.SPOTIFY_CLIENT_ID;
    delete process.env.SPOTIFY_CLIENT_SECRET;
    delete process.env.NEXTAUTH_SECRET;

    const { validateEnv } = require("@/lib/env");
    expect(() => validateEnv()).toThrow("Missing required environment variables");
  });

  it("should not throw when all required vars are present", () => {
    process.env.SPOTIFY_CLIENT_ID = "test-id";
    process.env.SPOTIFY_CLIENT_SECRET = "test-secret";
    process.env.NEXTAUTH_SECRET = "a-very-long-secret-that-is-at-least-32-chars";

    const { validateEnv } = require("@/lib/env");
    expect(() => validateEnv()).not.toThrow();
  });

  it("should warn about weak NEXTAUTH_SECRET", () => {
    process.env.SPOTIFY_CLIENT_ID = "test-id";
    process.env.SPOTIFY_CLIENT_SECRET = "test-secret";
    process.env.NEXTAUTH_SECRET = "short";

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const { validateEnv } = require("@/lib/env");
    validateEnv();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("NEXTAUTH_SECRET is shorter than 32 characters")
    );
    consoleSpy.mockRestore();
  });
});
