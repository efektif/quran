import { describe, expect, test } from "vitest";

import { quranData } from "./quran";

describe("Quran catalog", () => {
  test("contains all 114 surahs in canonical order", () => {
    expect(quranData.surahs).toHaveLength(114);
    expect(quranData.surahs.map(({ number }) => number)).toEqual(
      Array.from({ length: 114 }, (_, index) => index + 1),
    );
  });

  test("has valid verse counts and unique names", () => {
    expect(quranData.surahs.every(({ numberOfAyahs }) => numberOfAyahs > 0)).toBe(true);
    expect(new Set(quranData.surahs.map(({ englishName }) => englishName)).size).toBe(114);
  });

  test("includes an Indonesian Kemenag translation for every ayah", () => {
    const ayahs = quranData.surahs.flatMap(({ ayahs }) => ayahs);

    expect(ayahs).toHaveLength(6_236);
    expect(ayahs.every(({ translation }) => translation.trim().length > 0)).toBe(true);
    expect(ayahs[0].translation).toBe("Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.");
  });
});
