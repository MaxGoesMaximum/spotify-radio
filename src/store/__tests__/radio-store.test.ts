/**
 * @jest-environment jsdom
 */

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve(new Response())) as jest.Mock;

import { useRadioStore } from "../radio-store";

describe("useRadioStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    (global.fetch as jest.Mock).mockClear();
    // Reset store to defaults
    useRadioStore.setState({
      isPlaying: false,
      currentTrack: null,
      queue: [],
      volume: 0.7,
      progress: 0,
      duration: 0,
      favorites: [],
      songHistory: [],
      skipCount: 0,
      sessionTrackCount: 0,
    });
  });

  it("has correct default values", () => {
    const state = useRadioStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.volume).toBe(0.7);
    expect(state.currentTrack).toBeNull();
    expect(state.favorites).toEqual([]);
  });

  it("sets playing state", () => {
    useRadioStore.getState().setPlaying(true);
    expect(useRadioStore.getState().isPlaying).toBe(true);
  });

  it("sets volume and persists to localStorage", () => {
    useRadioStore.getState().setVolume(0.5);
    expect(useRadioStore.getState().volume).toBe(0.5);
    expect(localStorageMock.getItem("sr_volume")).toBe("0.5");
  });

  it("toggles favorites", () => {
    const store = useRadioStore.getState();

    store.toggleFavorite("track1");
    expect(useRadioStore.getState().favorites).toContain("track1");

    store.toggleFavorite("track1");
    expect(useRadioStore.getState().favorites).not.toContain("track1");
  });

  it("increments skip count", () => {
    useRadioStore.getState().incrementSkipCount();
    useRadioStore.getState().incrementSkipCount();
    expect(useRadioStore.getState().skipCount).toBe(2);
  });

  it("increments session track count", () => {
    useRadioStore.getState().incrementSessionTrackCount();
    expect(useRadioStore.getState().sessionTrackCount).toBe(1);
  });

  it("manages queue correctly", () => {
    const track1 = { id: "1", name: "Track 1", artists: [], album: { id: "a1", name: "Album", images: [] }, duration_ms: 200000, uri: "spotify:track:1", preview_url: null };
    const track2 = { id: "2", name: "Track 2", artists: [], album: { id: "a2", name: "Album", images: [] }, duration_ms: 200000, uri: "spotify:track:2", preview_url: null };

    useRadioStore.getState().addToQueue([track1, track2]);
    expect(useRadioStore.getState().queue).toHaveLength(2);

    const next = useRadioStore.getState().popQueue();
    expect(next?.id).toBe("1");
    expect(useRadioStore.getState().queue).toHaveLength(1);
  });

  it("sets genre and clears queue", () => {
    const track = { id: "1", name: "Track", artists: [], album: { id: "a", name: "Album", images: [] }, duration_ms: 200000, uri: "spotify:track:1", preview_url: null };
    useRadioStore.getState().addToQueue([track]);

    useRadioStore.getState().setGenre("rock" as any);
    expect(useRadioStore.getState().currentGenre).toBe("rock");
    expect(useRadioStore.getState().queue).toHaveLength(0);
  });

  it("limits song history to 50 entries", () => {
    const track = { id: "1", name: "Track", artists: [{ id: "a", name: "Artist" }], album: { id: "a", name: "Album", images: [] }, duration_ms: 200000, uri: "spotify:track:1", preview_url: null };

    for (let i = 0; i < 60; i++) {
      useRadioStore.getState().addToHistory(track, "pop" as any);
    }

    expect(useRadioStore.getState().songHistory).toHaveLength(50);
  });
});
