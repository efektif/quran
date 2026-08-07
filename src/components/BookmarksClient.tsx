"use client";

import Link from "next/link";
import { useMemo } from "react";

import { SURAH_INDEX } from "../data/surah-index";
import { useHasHydrated, useQuranStore } from "../lib/store";

export function BookmarksClient() {
  const hydrated = useHasHydrated();
  const bookmarks = useQuranStore((state) => state.bookmarks);
  const toggleBookmark = useQuranStore((state) => state.toggleBookmark);

  const groups = useMemo(() => {
    const bySurah = new Map<number, number[]>();
    for (const bookmark of [...bookmarks].sort((a, b) => b.createdAt - a.createdAt)) {
      const list = bySurah.get(bookmark.surah) ?? [];
      list.push(bookmark.ayah);
      bySurah.set(bookmark.surah, list);
    }
    return [...bySurah.entries()]
      .map(([surahNumber, ayahs]) => ({
        meta: SURAH_INDEX[surahNumber - 1],
        ayahs: [...ayahs].sort((a, b) => a - b),
      }))
      .filter((group) => group.meta);
  }, [bookmarks]);

  if (!hydrated) {
    return (
      <div className="py-10 text-center text-sm text-muted" role="status">
        Memuat…
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-text">Bookmark</h1>
      <p className="mt-1 text-sm text-muted">Ayat yang kamu simpan, dikelompokkan per surah.</p>

      {groups.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-base p-8 text-center">
          <p className="text-sm text-muted">
            Belum ada bookmark. Buka surah lalu tekan tombol Bookmark pada ayat mana pun.
          </p>
          <Link
            href="/"
            className="motion-fade mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-bold text-on-primary"
          >
            Mulai membaca
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.meta.number} aria-label={group.meta.englishName}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-base font-bold text-text">
                  {group.meta.number}. {group.meta.englishName}
                </h2>
                <span className="font-arabic text-lg text-primary">{group.meta.name}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {group.ayahs.map((ayah) => (
                  <li key={ayah} className="flex items-center gap-2">
                    <Link
                      href={`/surah/${group.meta.number}/?ayat=${ayah}`}
                      aria-label={`Buka ${group.meta.englishName} ayat ${ayah}`}
                      className="motion-fade flex flex-1 items-center justify-between rounded-lg border border-border bg-base px-4 py-3 hover:border-primary"
                    >
                      <span className="text-sm font-medium text-text">Ayat {ayah}</span>
                      <span className="text-xs text-muted">{group.meta.englishName}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(group.meta.number, ayah)}
                      aria-label={`Hapus bookmark ${group.meta.englishName} ayat ${ayah}`}
                      className="motion-fade rounded-md border border-border px-3 py-3 text-xs font-semibold text-muted hover:text-text"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
