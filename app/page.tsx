import Link from "next/link";

import { SURAH_INDEX } from "../src/data/surah-index";

export default function HomePage() {
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-text">Al-Quran</h1>
      <p className="mt-1 text-sm text-muted">Pilih surah untuk dibaca</p>

      <ul className="mt-6 flex flex-col gap-2">
        {SURAH_INDEX.map((surah) => (
          <li key={surah.number}>
            <Link
              href={`/surah/${surah.number}/`}
              aria-label={`Buka surah ${surah.englishName}`}
              className="motion-fade flex items-center gap-4 rounded-lg border border-border bg-base p-4 hover:border-primary"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface text-sm font-semibold text-primary">
                {surah.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-text">
                  {surah.englishName}
                </span>
                <span className="block text-xs text-muted">
                  {surah.englishNameTranslation} / {surah.numberOfAyahs} ayat /{" "}
                  {surah.revelationType === "Meccan" ? "Makiyah" : "Madaniyah"}
                </span>
              </span>
              <span className="font-arabic text-xl text-primary">{surah.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
