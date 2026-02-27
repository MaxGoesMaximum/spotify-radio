import {
  updatePreferencesSchema,
  addFavoriteSchema,
  removeFavoriteSchema,
  addHistorySchema,
  ttsRequestSchema,
  weatherQuerySchema,
  paginationSchema,
} from "../validations";

describe("updatePreferencesSchema", () => {
  it("accepts valid partial preferences", () => {
    const result = updatePreferencesSchema.safeParse({ theme: "dark", volume: 0.5 });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updatePreferencesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid volume", () => {
    const result = updatePreferencesSchema.safeParse({ volume: 2.0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative volume", () => {
    const result = updatePreferencesSchema.safeParse({ volume: -0.1 });
    expect(result.success).toBe(false);
  });
});

describe("addFavoriteSchema", () => {
  it("accepts valid favorite", () => {
    const result = addFavoriteSchema.safeParse({
      trackId: "abc123",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing trackId", () => {
    const result = addFavoriteSchema.safeParse({
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty trackId", () => {
    const result = addFavoriteSchema.safeParse({
      trackId: "",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
    });
    expect(result.success).toBe(false);
  });
});

describe("removeFavoriteSchema", () => {
  it("accepts valid trackId", () => {
    const result = removeFavoriteSchema.safeParse({ trackId: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty trackId", () => {
    const result = removeFavoriteSchema.safeParse({ trackId: "" });
    expect(result.success).toBe(false);
  });
});

describe("addHistorySchema", () => {
  it("accepts valid history entry", () => {
    const result = addHistorySchema.safeParse({
      trackId: "abc123",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
      genre: "pop",
      durationMs: 240000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts without optional durationMs", () => {
    const result = addHistorySchema.safeParse({
      trackId: "abc123",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
      genre: "pop",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative durationMs", () => {
    const result = addHistorySchema.safeParse({
      trackId: "abc123",
      trackName: "Test Song",
      artistName: "Test Artist",
      albumName: "Test Album",
      genre: "pop",
      durationMs: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("weatherQuerySchema", () => {
  it("accepts valid coordinates", () => {
    const result = weatherQuerySchema.safeParse({ lat: "52.37", lon: "4.89" });
    expect(result.success).toBe(true);
  });

  it("coerces string to number", () => {
    const result = weatherQuerySchema.safeParse({ lat: "52.37", lon: "4.89" });
    if (result.success) {
      expect(result.data.lat).toBe(52.37);
      expect(result.data.lon).toBe(4.89);
    }
  });

  it("rejects out-of-range latitude", () => {
    const result = weatherQuerySchema.safeParse({ lat: "100", lon: "4.89" });
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("accepts valid pagination", () => {
    const result = paginationSchema.safeParse({ page: "2", limit: "20" });
    expect(result.success).toBe(true);
  });

  it("defaults to page 1 and limit 20", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = paginationSchema.safeParse({ page: "1", limit: "200" });
    expect(result.success).toBe(false);
  });
});
