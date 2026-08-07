import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getJuzMap, getSurah } from "../../../src/lib/quran";
import type { Ayah, SurahMeta } from "../../../src/lib/types";

interface JuzPageProps {
  params: Promise<{ number: string }>;
}

const juzNumbers = Array.from({ length: 30 }, (_, index) => ({ number: String(index + 1) }));

export function generateStaticParams() {
  return juzNumbers;
}

export async function generateMetadata({ params }: JuzPageProps): Promise<Metadata> {
  const { number } = await params;
  return { title: `Juz ${number}` };
}

export default async function JuzPage({ params }: JuzPageProps) {
  const { number } = await params;
  const juzNumber = Number(number);
  if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) notFound();

  const juzMap = await getJuzMap();
  const start = juzMap[juzNumber - 1];
  const end = juzNumber < 30 ? juzMap[juzNumber] : null;

  const groups: { meta: SurahMeta; ayahs: Ayah[] }[] = [];
  for (let surahNumber = start.surahNumber; surahNumber <= 114; surahNumber += 1) {
    const surah = await getSurah(surahNumber);
    const ayahs = surah.ayahs.filter((ayah) => ayah.juz === juzNumber);
    if (ayahs.length > 0) {
      const { ayahs: _omit, ...meta } = surah;
      groups.push({ meta, ayahs });
    }
    if (end && surahNumber === end.surahNumber) break;
  }

  const totalAyahs = groups.reduce((sum, group) => sum + group.ayahs.length, 0);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Juz {juzNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            Mulai dari {start.surahEnglishName} ayat {start.ayahNumber} / {totalAyahs} ayat /{" "}
            {groups.length} surah
          </p>
        </div>
        <nav className="flex gap-2" aria-label="Navigasi juz">
          {juzNumber > 1 ? (
            <Link
              href={`/juz/${juzNumber - 1}/`}
              className="motion-fade rounded-sm border border-border bg-base px-3 py-2 text-sm font-medium text-text hover:border-primary"
            >
              ← Juz {juzNumber - 1}
            </Link>
          ) : null}
          {juzNumber < 30 ? (
            <Link
              href={`/juz/${juzNumber + 1}/`}
              className="motion-fade rounded-sm border border-border bg-base px-3 py-2 text-sm font-medium text-text hover:border-primary"
            >
              Juz {juzNumber + 1} →
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="flex flex-col gap-6 py-6">
        {groups.map((group) => (
          <section key={group.meta.number} aria-label={group.meta.englishName}>
            <Link
              href={`/surah/${group.meta.number}/?ayat=${group.ayahs[0].numberInSurah}`}
              className="motion-fade mb-3 flex items-baseline justify-between gap-3 rounded-sm border border-border bg-surface p-4 hover:border-primary"
            >
              <span className="font-display text-base font-bold text-text">
                {group.meta.number}. {group.meta.englishName}
                <span className="ml-2 text-xs font-normal text-muted">
                  {group.ayahs.length} ayat di juz ini
                </span>
              </span>
              <span className="font-arabic shrink-0 text-xl text-primary">{group.meta.name}</span>
            </Link>

            <div className="rounded-sm border border-border bg-base p-5">
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-right text-2xl leading-[2.3] text-arabic"
              >
                {group.ayahs.map((ayah) => (
                  <span key={ayah.number}>
                    {ayah.text}{" "}
                    <Link
                      href={`/surah/${group.meta.number}/?ayat=${ayah.numberInSurah}`}
                      aria-label={`Buka ${group.meta.englishName} ayat ${ayah.numberInSurah}`}
                      className="mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-double border-gold/70 align-middle text-[11px] text-gold no-underline"
                      dir="ltr"
                    >
                      {ayah.numberInSurah}
                    </Link>{" "}
                  </span>
                ))}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
