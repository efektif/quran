import { writeFile } from "node:fs/promises";

/**
 * Script to fetch Quran data from alquran.cloud API
 * Run with: pnpm data:fetch:quran
 */

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
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

interface ApiResponse {
  code: number;
  status: string;
  data: {
    surahs: ApiSurah[];
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
      direction: string;
    };
  };
}

async function fetchQuranData() {
  console.log("Fetching Quran data with tashkeel (quran-uthmani)...");

  const response = await fetch("https://api.alquran.cloud/v1/quran/quran-uthmani");
  const json: ApiResponse = await response.json();

  if (json.code !== 200) {
    throw new Error(`API error: ${json.status}`);
  }

  const surahs = json.data.surahs.map((surah) => {
    const ayahs = surah.ayahs.map((ayah) => ({
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      text: ayah.text,
      juz: ayah.juz,
      page: ayah.page,
      hizbQuarter: ayah.hizbQuarter,
    }));

    return {
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: ayahs.length, // Calculate from array since API doesn't include it
      revelationType: surah.revelationType as "Meccan" | "Medinan",
      ayahs,
    };
  });

  // Generate TypeScript file
  const output = `// Auto-generated Quran data with tashkeel (diacritical marks)
// Source: quran-uthmani edition from api.alquran.cloud
// Generated: ${new Date().toISOString()}

import type { QuranData } from '../types/quran';

export const quranData: QuranData = ${JSON.stringify({ surahs }, null, 2)};

export default quranData;
`;

  await writeFile("src/data/quran.ts", output);

  console.log(`Successfully generated src/data/quran.ts`);
  console.log(`Total surahs: ${surahs.length}`);
  console.log(`Total ayahs: ${surahs.reduce((acc, s) => acc + s.ayahs.length, 0)}`);
}

fetchQuranData().catch(console.error);
