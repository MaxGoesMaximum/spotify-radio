/**
 * Tests for favorites API validation and business logic
 */
import { z } from "zod";

// Test the validation schemas used by the favorites endpoint
const addFavoriteSchema = z.object({
  trackId: z.string().min(1),
  trackName: z.string().min(1),
  artistName: z.string().min(1),
  albumName: z.string().min(1),
  albumImage: z.string().optional(),
});

describe("Favorites API validation", () => {
  it("should accept valid favorite data", () => {
    const result = addFavoriteSchema.safeParse({
      trackId: "track-123",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing trackId", () => {
    const result = addFavoriteSchema.safeParse({
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty trackId", () => {
    const result = addFavoriteSchema.safeParse({
      trackId: "",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = addFavoriteSchema.safeParse({
      trackId: "track-123",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional albumImage", () => {
    const result = addFavoriteSchema.safeParse({
      trackId: "track-123",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
      albumImage: "https://i.scdn.co/image/abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.albumImage).toBe("https://i.scdn.co/image/abc123");
    }
  });
});
