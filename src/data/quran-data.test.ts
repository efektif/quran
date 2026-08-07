import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { SURAH_INDEX } from "./surah-index";
import { normalizeArabic } from "../lib/arabic";
import type { JuzStart, SearchIndexEntry, Surah } from "../lib/types";

const DATA_DIR = path.join(__dirname, "..", "..", "public", "data");

async function readSurah(number: number): Promise<Surah> {
  const raw = await readFile(path.join(DATA_DIR, "surah", `${number}.json`), "utf8");
  return JSON.parse(raw) as Surah;
}

describe("generated Quran data", () => {
  test("surah index lists all 114 surahs in canonical order", () => {
    expect(SURAH_INDEX).toHaveLength(114);
    expect(SURAH_INDEX.map(({ number }) => number)).toEqual(
      Array.from({ length: 114 }, (_, index) => index + 1),
    );
    expect(new Set(SURAH_INDEX.map(({ englishName }) => englishName)).size).toBe(114);
  });

  test("every surah JSON matches its index entry and all 6236 ayahs exist", async () => {
    let totalAyahs = 0;
    for (const meta of SURAH_INDEX) {
      const surah = await readSurah(meta.number);
      expect(surah.number).toBe(meta.number);
      expect(surah.ayahs).toHaveLength(meta.numberOfAyahs);
      for (const ayah of surah.ayahs) {
        expect(ayah.text.trim().length).toBeGreaterThan(0);
        expect(ayah.translationId.trim().length).toBeGreaterThan(0);
        expect(ayah.translationEn.trim().length).toBeGreaterThan(0);
        expect(ayah.juz).toBeGreaterThanOrEqual(1);
        expect(ayah.juz).toBeLessThanOrEqual(30);
      }
      totalAyahs += surah.ayahs.length;
    }
    expect(totalAyahs).toBe(6_236);
  });

  test("bismillah is stripped from opening ayahs but kept in surah 1", async () => {
    const startsWithBismillah = (text: string) =>
      normalizeArabic(text).startsWith(normalizeArabic("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"));

    const fatihah = await readSurah(1);
    expect(startsWithBismillah(fatihah.ayahs[0].text)).toBe(true);
    expect(fatihah.ayahs[0].translationId).toBe(
      "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.",
    );

    const baqarah = await readSurah(2);
    expect(startsWithBismillah(baqarah.ayahs[0].text)).toBe(false);
    expect(baqarah.ayahs[0].translationId).toContain("Alif");

    const tawbah = await readSurah(9);
    expect(startsWithBismillah(tawbah.ayahs[0].text)).toBe(false);
  });

  test("translation footnotes survive the pipeline", async () => {
    const fatihah = await readSurah(1);
    expect(fatihah.ayahs[3].translationFootnotes?.toLowerCase()).toContain("yaumidd");
  });

  test("juz map has 30 entries with correct boundaries", async () => {
    const raw = await readFile(path.join(DATA_DIR, "juz-map.json"), "utf8");
    const juzMap = JSON.parse(raw) as JuzStart[];

    expect(juzMap).toHaveLength(30);
    expect(juzMap[0]).toMatchObject({ juz: 1, surahNumber: 1, ayahNumber: 1 });
    expect(juzMap[29]).toMatchObject({ juz: 30, surahNumber: 78, ayahNumber: 1 });
    expect(juzMap[1]).toMatchObject({ juz: 2, surahNumber: 2, ayahNumber: 142 });
    for (let index = 1; index < juzMap.length; index += 1) {
      expect(juzMap[index].juz).toBe(juzMap[index - 1].juz + 1);
    }
  });

  test("search index covers every ayah with normalized Arabic", async () => {
    const raw = await readFile(path.join(DATA_DIR, "search-index.json"), "utf8");
    const searchIndex = JSON.parse(raw) as SearchIndexEntry[];

    expect(searchIndex).toHaveLength(6_236);
    expect(searchIndex[0].s).toBe(1);
    expect(searchIndex[0].a).toBe(1);
    // No tashkeel left after normalization.
    expect(searchIndex.every((entry) => !/[ً-ٰٟ]/.test(entry.ar))).toBe(true);
    expect(searchIndex.every((entry) => entry.id.length > 0 && entry.en.length > 0)).toBe(true);
  });
});
