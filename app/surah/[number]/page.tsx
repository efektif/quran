import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SurahReader } from "../../../src/components/SurahReader";
import { getSurah, isValidSurahNumber } from "../../../src/lib/quran";
import { SURAH_INDEX } from "../../../src/data/surah-index";

interface SurahPageProps {
  params: Promise<{ number: string }>;
}

export function generateStaticParams() {
  return SURAH_INDEX.map((surah) => ({ number: String(surah.number) }));
}

export async function generateMetadata({ params }: SurahPageProps): Promise<Metadata> {
  const { number } = await params;
  const surahNumber = Number(number);
  if (!isValidSurahNumber(surahNumber)) return { title: "Surah tidak ditemukan" };
  const meta = SURAH_INDEX[surahNumber - 1];
  return {
    title: `${meta.englishName} (${meta.name})`,
    description: `Surah ${meta.englishName} — ${meta.englishNameTranslation}, ${meta.numberOfAyahs} ayat. Terjemahan Kemenag RI dan English.`,
  };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { number } = await params;
  const surahNumber = Number(number);
  if (!isValidSurahNumber(surahNumber)) notFound();

  const surah = await getSurah(surahNumber);
  const prev = surahNumber > 1 ? SURAH_INDEX[surahNumber - 2] : null;
  const next = surahNumber < 114 ? SURAH_INDEX[surahNumber] : null;

  return (
    <Suspense fallback={null}>
      <SurahReader surah={surah} prev={prev ?? null} next={next ?? null} />
    </Suspense>
  );
}
