import { beforeEach, describe, expect, it, vi } from "vitest";

// zustand/persist writes to localStorage; stub it for the node test env.
const memoryStorage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => memoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStorage.delete(key);
  },
  clear: () => memoryStorage.clear(),
  key: (index: number) => [...memoryStorage.keys()][index] ?? null,
  get length() {
    return memoryStorage.size;
  },
});

import { useQuranStore } from "./store";

function resetStore() {
  useQuranStore.setState({
    theme: "light",
    translationMode: "id",
    readingMode: "mushaf",
    bookmarks: [],
    lastViewed: null,
    readingLog: {},
    alKahfDismissedDay: null,
    location: null,
    sholatMethod: "Kemenag",
    audioAutoAdvance: true,
  });
  memoryStorage.clear();
}

describe("quran store", () => {
  beforeEach(resetStore);

  it("has light paper default and Kemenag prayer method", () => {
    const state = useQuranStore.getState();
    expect(state.theme).toBe("light");
    expect(state.translationMode).toBe("id");
    expect(state.readingMode).toBe("mushaf");
    expect(state.sholatMethod).toBe("Kemenag");
    expect(state.audioAutoAdvance).toBe(true);
  });

  it("toggles bookmarks on and off", () => {
    const { toggleBookmark } = useQuranStore.getState();
    toggleBookmark(18, 10);
    expect(useQuranStore.getState().bookmarks).toEqual([
      { surah: 18, ayah: 10, createdAt: expect.any(Number) },
    ]);

    toggleBookmark(18, 10);
    expect(useQuranStore.getState().bookmarks).toEqual([]);
  });

  it("keeps bookmarks of different ayahs independently", () => {
    const { toggleBookmark } = useQuranStore.getState();
    toggleBookmark(1, 1);
    toggleBookmark(1, 2);
    toggleBookmark(2, 255);
    toggleBookmark(1, 2);
    expect(useQuranStore.getState().bookmarks.map((b) => `${b.surah}:${b.ayah}`)).toEqual([
      "1:1",
      "2:255",
    ]);
  });

  it("records last viewed ayah", () => {
    useQuranStore.getState().setLastViewed(2, 255);
    const lastViewed = useQuranStore.getState().lastViewed;
    expect(lastViewed?.surahNumber).toBe(2);
    expect(lastViewed?.ayahNumber).toBe(255);
  });

  it("logs ayah reads once per day and deduplicates", () => {
    const { logAyahRead } = useQuranStore.getState();
    logAyahRead(1, 1, "2026-08-07");
    logAyahRead(1, 1, "2026-08-07");
    logAyahRead(1, 2, "2026-08-07");
    expect(useQuranStore.getState().readingLog["2026-08-07"]).toEqual(["1:1", "1:2"]);
  });

  it("bounds the reading log to the last 14 days", () => {
    const { logAyahRead } = useQuranStore.getState();
    for (let i = 1; i <= 20; i += 1) {
      const day = `2026-07-${String(i).padStart(2, "0")}`;
      logAyahRead(1, i, day);
    }
    const keys = Object.keys(useQuranStore.getState().readingLog);
    expect(keys.length).toBe(14);
    expect(keys).toContain("2026-07-20");
    expect(keys).not.toContain("2026-07-01");
  });

  it("persists al-kahf dismissal for the day", () => {
    useQuranStore.getState().dismissAlKahf("2026-08-07");
    expect(useQuranStore.getState().alKahfDismissedDay).toBe("2026-08-07");
  });

  it("stores sholat location with timezone", () => {
    useQuranStore.getState().setLocation({
      label: "Kota Jakarta",
      latitude: -6.2,
      longitude: 106.82,
      timezone: "Asia/Jakarta",
    });
    expect(useQuranStore.getState().location?.timezone).toBe("Asia/Jakarta");
  });
});
