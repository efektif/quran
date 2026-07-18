import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { quranData } from "../src/data/quran.ts";

const TRANSLATION_KEY = "indonesian_affairs";
const TRANSLATION_VERSION = "1.0.1";
const BATCH_SIZE = 12;
const OUTPUT_PATH = fileURLToPath(new URL("../src/data/quran.ts", import.meta.url));

const translatedSurahs = [];
for (let start = 1; start <= quranData.surahs.length; start += BATCH_SIZE) {
  const surahNumbers = Array.from(
    { length: Math.min(BATCH_SIZE, quranData.surahs.length - start + 1) },
    (_, index) => start + index,
  );
  const batch = await Promise.all(surahNumbers.map(fetchSurahTranslation));
  translatedSurahs.push(...batch);
}

let translatedAyahCount = 0;
const surahs = quranData.surahs.map((surah, surahIndex) => {
  const translations = translatedSurahs[surahIndex];
  if (translations.length !== surah.ayahs.length) {
    throw new Error(
      `Surah ${surah.number} has ${surah.ayahs.length} ayahs but ${translations.length} translations`,
    );
  }

  return {
    ...surah,
    ayahs: surah.ayahs.map((ayah, ayahIndex) => {
      const translated = translations[ayahIndex];
      if (
        Number(translated.sura) !== surah.number ||
        Number(translated.aya) !== ayah.numberInSurah
      ) {
        throw new Error(`Translation mismatch at ${surah.number}:${ayah.numberInSurah}`);
      }
      translatedAyahCount += 1;
      return {
        ...ayah,
        translation: translated.translation,
        ...(translated.footnotes ? { translationFootnotes: translated.footnotes } : {}),
      };
    }),
  };
});

const generated = `// Auto-generated Quran data with tashkeel (diacritical marks)\n// Arabic source: quran-uthmani edition from api.alquran.cloud\n// Translation: Kementerian Agama Republik Indonesia via QuranEnc (${TRANSLATION_KEY} v${TRANSLATION_VERSION})\n// Regenerate with: bun run data:sync:translations\n\nimport type { QuranData } from '../types/quran';\n\nexport const quranData: QuranData = ${JSON.stringify({ surahs }, null, 2)};\n`;
await writeFile(OUTPUT_PATH, generated);
console.log(`Synced ${translatedAyahCount} Indonesian ayah translations.`);

async function fetchSurahTranslation(surahNumber) {
  const response = await fetch(
    `https://quranenc.com/api/v1/translation/sura/${TRANSLATION_KEY}/${surahNumber}`,
  );
  if (!response.ok) {
    throw new Error(`QuranEnc surah ${surahNumber} returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.result)) {
    throw new Error(`QuranEnc surah ${surahNumber} returned an invalid payload`);
  }
  return payload.result;
}
