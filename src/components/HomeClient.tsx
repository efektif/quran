"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useHasHydrated, useQuranStore } from "../lib/store";
import type { JuzStart, SurahMeta } from "../lib/types";

interface HomeClientProps {
  surahs: SurahMeta[];
  juzMap: JuzStart[];
}

export function HomeClient({ surahs, juzMap }: HomeClientProps) {
  const [tab, setTab] = useState<"surah" | "juz">("surah");
  const hydrated = useHasHydrated();
  const lastViewed = useQuranStore((state) => state.lastViewed);
  const bookmarks = useQuranStore((state) => state.bookmarks);
  const readingLog = useQuranStore((state) => state.readingLog);

  const lastViewedSurah = useMemo(
    () => (lastViewed ? surahs.find((s) => s.number === lastViewed.surahNumber) : null),
    [lastViewed, surahs],
  );

  const weekAyahCount = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    const sinceKey = since.toLocaleDateString("en-CA");
    return Object.entries(readingLog)
      .filter(([day]) => day >= sinceKey)
      .reduce((total, [, ayahs]) => total + ayahs.length, 0);
  }, [readingLog]);

  const bookmarkedSurahs = useMemo(() => new Set(bookmarks.map((b) => b.surah)), [bookmarks]);

  return (
    <div className="py-5">
      {hydrated && lastViewed && lastViewedSurah ? (
        <Link
          href={`/surah/${lastViewed.surahNumber}/?ayat=${lastViewed.ayahNumber}`}
          aria-label={`Lanjutkan membaca ${lastViewedSurah.englishName} ayat ${lastViewed.ayahNumber}`}
          className="motion-fade mb-4 flex items-center gap-4 rounded-sm border-[3px] border-double border-gold/70 bg-primary-soft p-4"
        >
          <span className="rounded-sm bg-primary px-3 py-2 text-xs font-bold text-on-primary">
            Lanjut
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-primary">Lanjutkan Membaca</span>
            <span className="block text-xs text-muted">
              {lastViewedSurah.englishName} / Ayat {lastViewed.ayahNumber}
            </span>
          </span>
          <span className="font-arabic text-xl text-arabic">{lastViewedSurah.name}</span>
        </Link>
      ) : null}

      {hydrated && weekAyahCount > 0 ? (
        <p className="mb-3 text-xs text-muted italic">
          {weekAyahCount} ayat dibaca dalam 7 hari terakhir.
        </p>
      ) : null}

      <div
        className="mb-0 flex items-center gap-1 rounded-t-sm border border-b-0 border-border bg-surface p-1"
        role="tablist"
        aria-label="Navigasi daftar"
      >
        {(["surah", "juz"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`motion-fade flex-1 rounded-sm border px-3 py-2 text-sm font-semibold ${
              tab === value
                ? "border-border bg-base text-text"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {value === "surah" ? "Surah" : "Juz"}
          </button>
        ))}
      </div>

      {tab === "surah" ? (
        <ul className="divide-y divide-border rounded-b-sm border border-border bg-base">
          {surahs.map((surah) => (
            <li key={surah.number}>
              <Link
                href={`/surah/${surah.number}/`}
                aria-label={`Buka surah ${surah.englishName}`}
                className="motion-fade flex items-center gap-3 px-4 py-3 hover:bg-surface"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-double border-gold/70 font-display text-sm font-bold text-gold">
                  {surah.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-display text-base font-bold text-text">
                    <span className="truncate">{surah.englishName}</span>
                    {hydrated && bookmarkedSurahs.has(surah.number) ? (
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-primary"
                        title="Ada ayat tersimpan"
                        aria-label="Ada ayat tersimpan"
                      />
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted">
                    {surah.englishNameTranslation} · {surah.numberOfAyahs} ayat ·{" "}
                    {surah.revelationType === "Meccan" ? "Makiyah" : "Madaniyah"}
                  </span>
                </span>
                <span className="font-arabic shrink-0 text-xl text-primary">{surah.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-px rounded-b-sm border border-border bg-border sm:grid-cols-3">
          {juzMap.map((juz) => (
            <li key={juz.juz} className="bg-base">
              <Link
                href={`/juz/${juz.juz}/`}
                aria-label={`Buka juz ${juz.juz}, mulai dari ${juz.surahEnglishName} ayat ${juz.ayahNumber}`}
                className="motion-fade block px-4 py-3 hover:bg-surface"
              >
                <span className="block font-display text-base font-bold text-primary">
                  Juz {juz.juz}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {juz.surahEnglishName} : {juz.ayahNumber}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
