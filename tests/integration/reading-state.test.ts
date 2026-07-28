import { describe, expect, vi, test } from "vitest";

const values = new Map<string, string>();
vi.doMock("react-native", () => ({ Platform: { OS: "web" } }));
vi.doMock("expo-secure-store", () => ({}));
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  },
});

// Storage selects its platform implementation when imported.
const { storage } = await import("../../src/utils/storage");
const { quranData } = await import("../../src/data/quran");

describe("Quran reading-state integration", () => {
  test("persists a verse location that resolves to catalog data", () => {
    const location = { surahNumber: 2, ayahNumber: 255, timestamp: 1_750_000_000_000 };
    storage.set("lastViewedAyat", JSON.stringify(location));

    const restored = JSON.parse(storage.getString("lastViewedAyat") ?? "null") as typeof location;
    const surah = quranData.surahs.find(({ number }) => number === restored.surahNumber);
    const ayah = surah?.ayahs.find(({ numberInSurah }) => numberInSurah === restored.ayahNumber);

    expect(surah?.englishName).toBe("Al-Baqara");
    expect(ayah?.numberInSurah).toBe(255);
    expect(ayah?.text.length).toBeGreaterThan(0);
    expect(ayah?.translation.length).toBeGreaterThan(0);
  });
});
