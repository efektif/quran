import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeArabic, stripBismillahPrefix } from "../src/lib/arabic";
import type { JuzStart, SearchIndexEntry, Surah, SurahMeta } from "../src/lib/types";

/**
 * Builds the static Quran data assets consumed by the Next.js app.
 * Run with: pnpm data:fetch
 *
 * Sources:
 * - Arabic (quran-uthmani) + juz/page/hizb metadata: api.alquran.cloud
 * - Indonesian translation (Kemenag RI, with footnotes): quranenc.com
 * - English translation (Saheeh International): api.alquran.cloud en.sahih
 *
 * Emits per-surah JSON under public/data so the app never bundles the whole
 * Quran into one module.
 */

const TOTAL_SURAHS = 114;
const TOTAL_AYAHS = 6_236;
const TRANSLATION_BATCH_SIZE = 12;
const INDONESIAN_TRANSLATION_KEY = "indonesian_affairs";

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  hizbQuarter: number;
}

interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: ApiAyah[];
}

interface AlquranCloudResponse {
  code: number;
  status: string;
  data: { surahs: ApiSurah[] };
}

interface QuranEncAyah {
  sura: string;
  aya: string;
  translation: string;
  footnotes?: string;
}

async function fetchEdition(edition: string): Promise<ApiSurah[]> {
  const response = await fetch(`https://api.alquran.cloud/v1/quran/${edition}`);
  if (!response.ok) {
    throw new Error(`alquran.cloud ${edition} returned HTTP ${response.status}`);
  }
  const json = (await response.json()) as AlquranCloudResponse;
  if (json.code !== 200 || !Array.isArray(json.data?.surahs)) {
    throw new Error(`alquran.cloud ${edition} error: ${json.status}`);
  }
  return json.data.surahs;
}

async function fetchSurahTranslation(surahNumber: number): Promise<QuranEncAyah[]> {
  const response = await fetch(
    `https://quranenc.com/api/v1/translation/sura/${INDONESIAN_TRANSLATION_KEY}/${surahNumber}`,
  );
  if (!response.ok) {
    throw new Error(`QuranEnc surah ${surahNumber} returned HTTP ${response.status}`);
  }
  const payload = (await response.json()) as { result?: QuranEncAyah[] };
  if (!Array.isArray(payload.result)) {
    throw new Error(`QuranEnc surah ${surahNumber} returned an invalid payload`);
  }
  return payload.result;
}

async function fetchIndonesianTranslations(): Promise<QuranEncAyah[][]> {
  const surahs: QuranEncAyah[][] = [];
  for (let start = 1; start <= TOTAL_SURAHS; start += TRANSLATION_BATCH_SIZE) {
    const batch = await Promise.all(
      Array.from(
        { length: Math.min(TRANSLATION_BATCH_SIZE, TOTAL_SURAHS - start + 1) },
        (_, index) => fetchSurahTranslation(start + index),
      ),
    );
    surahs.push(...batch);
    console.log(`Indonesian translations: ${surahs.length}/${TOTAL_SURAHS} surahs`);
  }
  return surahs;
}

function assertAyahAlignment(surah: ApiSurah, english: ApiSurah, indonesian: QuranEncAyah[]) {
  if (english.number !== surah.number || english.ayahs.length !== surah.ayahs.length) {
    throw new Error(`English edition mismatch at surah ${surah.number}`);
  }
  if (indonesian.length !== surah.ayahs.length) {
    throw new Error(
      `Surah ${surah.number} has ${surah.ayahs.length} ayahs but ${indonesian.length} Indonesian translations`,
    );
  }
}

async function main() {
  console.log("Fetching quran-uthmani and en.sahih editions...");
  const [arabicSurahs, englishSurahs] = await Promise.all([
    fetchEdition("quran-uthmani"),
    fetchEdition("en.sahih"),
  ]);
  const indonesianSurahs = await fetchIndonesianTranslations();

  if (arabicSurahs.length !== TOTAL_SURAHS) {
    throw new Error(`Expected ${TOTAL_SURAHS} surahs, got ${arabicSurahs.length}`);
  }

  // Canonical bismillah for this edition, taken from surah 1:1 (see arabic.ts).
  const bismillah = arabicSurahs[0].ayahs[0].text.replace(/^﻿/, "");

  const surahIndex: SurahMeta[] = [];
  const searchIndex: SearchIndexEntry[] = [];
  const juzMap: JuzStart[] = [];
  let totalAyahs = 0;
  let lastSeenJuz = 0;

  await mkdir(path.join("public", "data", "surah"), { recursive: true });

  for (const surah of arabicSurahs) {
    const english = englishSurahs[surah.number - 1];
    const indonesian = indonesianSurahs[surah.number - 1];
    assertAyahAlignment(surah, english, indonesian);

    const merged: Surah = {
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.ayahs.length,
      revelationType: surah.revelationType as Surah["revelationType"],
      startPage: surah.ayahs[0].page,
      ayahs: surah.ayahs.map((ayah, ayahIndex) => {
        const translated = indonesian[ayahIndex];
        if (
          Number(translated.sura) !== surah.number ||
          Number(translated.aya) !== ayah.numberInSurah
        ) {
          throw new Error(`Translation mismatch at ${surah.number}:${ayah.numberInSurah}`);
        }
        const text = stripBismillahPrefix(surah.number, ayah.numberInSurah, ayah.text, bismillah);
        totalAyahs += 1;

        // id/en are pre-lowercased: the client filters this index on every
        // keystroke, so the normalization cost is paid here once.
        searchIndex.push({
          s: surah.number,
          a: ayah.numberInSurah,
          ar: normalizeArabic(text),
          id: translated.translation.toLowerCase(),
          en: english.ayahs[ayahIndex].text.toLowerCase(),
        });

        if (ayah.juz > lastSeenJuz) {
          juzMap.push({
            juz: ayah.juz,
            surahNumber: surah.number,
            ayahNumber: ayah.numberInSurah,
            surahEnglishName: surah.englishName,
          });
          lastSeenJuz = ayah.juz;
        }

        return {
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text,
          translationId: translated.translation,
          ...(translated.footnotes ? { translationFootnotes: translated.footnotes } : {}),
          translationEn: english.ayahs[ayahIndex].text,
          juz: ayah.juz,
          page: ayah.page,
          hizbQuarter: ayah.hizbQuarter,
        };
      }),
    };

    surahIndex.push({
      number: merged.number,
      name: merged.name,
      englishName: merged.englishName,
      englishNameTranslation: merged.englishNameTranslation,
      numberOfAyahs: merged.numberOfAyahs,
      revelationType: merged.revelationType,
      startPage: merged.startPage,
    });

    await writeFile(
      path.join("public", "data", "surah", `${surah.number}.json`),
      JSON.stringify(merged),
    );
  }

  if (totalAyahs !== TOTAL_AYAHS) {
    throw new Error(`Expected ${TOTAL_AYAHS} ayahs, got ${totalAyahs}`);
  }
  if (juzMap.length !== 30) {
    throw new Error(`Expected 30 juz entries, got ${juzMap.length}`);
  }

  const surahIndexModule = `// Auto-generated by scripts/fetch-quran-data.ts — do not edit by hand.

import type { SurahMeta } from "../lib/types";

export const SURAH_INDEX: SurahMeta[] = ${JSON.stringify(surahIndex, null, 2)};
`;
  await writeFile(path.join("src", "data", "surah-index.ts"), surahIndexModule);

  await writeFile(path.join("public", "data", "search-index.json"), JSON.stringify(searchIndex));
  await writeFile(path.join("public", "data", "juz-map.json"), JSON.stringify(juzMap));

  console.log(`Wrote ${surahIndex.length} per-surah JSON files to public/data/surah/`);
  console.log(
    `Wrote search index (${searchIndex.length} entries) and juz map (${juzMap.length} juz)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
