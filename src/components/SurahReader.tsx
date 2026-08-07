"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAudioPlayer } from "../lib/audio";
import { BISMILLAH_TRANSLITERATION } from "../lib/constants";
import { useHasHydrated, useQuranStore } from "../lib/store";
import { getInitialVerseIndex } from "../utils/reader";
import { AyahCard } from "./AyahCard";
import { AudioPlayerBar } from "./AudioPlayerBar";
import type { Surah, SurahMeta } from "../lib/types";

interface SurahReaderProps {
  surah: Surah;
  prev: SurahMeta | null;
  next: SurahMeta | null;
}

const BISMILLAH_ARABIC = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

export function SurahReader({ surah, prev, next }: SurahReaderProps) {
  const hydrated = useHasHydrated();
  const readingMode = useQuranStore((state) => state.readingMode);
  const setReadingMode = useQuranStore((state) => state.setReadingMode);
  const setLastViewed = useQuranStore((state) => state.setLastViewed);
  const logAyahRead = useQuranStore((state) => state.logAyahRead);
  const searchParams = useSearchParams();

  const audio = useAudioPlayer(surah.number, surah.numberOfAyahs);

  const startAyah = Number(searchParams.get("ayat") ?? "1");
  const initialIndex = getInitialVerseIndex(startAyah, surah.ayahs.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Pager: scroll to the requested ayah once (deep link / resume).
  const pagerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (readingMode !== "pager" || initialIndex === 0) return;
    const target = pagerRef.current?.children[initialIndex];
    target?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mushaf: jump to the requested ayah anchor after mount.
  useEffect(() => {
    if (readingMode !== "mushaf" || initialIndex === 0) return;
    document
      .getElementById(`ayah-${surah.number}-${initialIndex + 1}`)
      ?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markViewed = useCallback(
    (ayahNumber: number) => {
      setLastViewed(surah.number, ayahNumber);
      logAyahRead(surah.number, ayahNumber, new Date().toLocaleDateString("en-CA"));
    },
    [surah.number, setLastViewed, logAyahRead],
  );

  useEffect(() => {
    markViewed(initialIndex + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pager: track which ayah holds the viewport.
  useEffect(() => {
    if (readingMode !== "pager") return;
    const container = pagerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (Number.isInteger(index)) {
              setCurrentIndex(index);
              markViewed(index + 1);
            }
          }
        }
      },
      { root: container, threshold: 0.55 },
    );
    for (const child of Array.from(container.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [readingMode, markViewed]);

  // Mushaf: record reading progress on scroll.
  useEffect(() => {
    if (readingMode !== "mushaf") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (Number.isInteger(index)) {
              setCurrentIndex(index);
              markViewed(index + 1);
            }
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    const nodes = document.querySelectorAll("[data-ayah-block]");
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [readingMode, markViewed]);

  const showBismillah = surah.number !== 1 && surah.number !== 9;

  const header = (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-text">
          {surah.number}. {surah.englishName}
        </h1>
        <p className="text-xs text-muted">
          {surah.englishNameTranslation} / {surah.numberOfAyahs} ayat /{" "}
          {surah.revelationType === "Meccan" ? "Makiyah" : "Madaniyah"}
        </p>
      </div>
      <span className="font-arabic shrink-0 text-2xl text-primary">{surah.name}</span>
    </div>
  );

  const modeToggle = (
    <div
      className="flex items-center gap-1 rounded-lg border border-border bg-base p-1"
      role="group"
      aria-label="Mode bacaan"
    >
      {(["mushaf", "pager"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setReadingMode(mode)}
          aria-pressed={readingMode === mode}
          className={`motion-fade rounded-md px-3 py-1.5 text-xs font-semibold ${
            readingMode === mode ? "bg-primary text-on-primary" : "text-muted hover:text-text"
          }`}
        >
          {mode === "mushaf" ? "Mushaf" : "Pager"}
        </button>
      ))}
    </div>
  );

  const bismillah = showBismillah ? (
    <div className="py-6 text-center">
      <p className="font-arabic text-3xl leading-loose text-arabic" dir="rtl">
        {BISMILLAH_ARABIC}
      </p>
      <p className="mt-1 text-xs text-muted">{BISMILLAH_TRANSLITERATION}</p>
    </div>
  ) : null;

  const surahNav = (
    <nav
      className="flex items-center justify-between gap-3 border-t border-border py-4"
      aria-label="Navigasi surah"
    >
      {prev ? (
        <Link
          href={`/surah/${prev.number}/`}
          className="motion-fade rounded-md border border-border bg-base px-3 py-2 text-sm font-medium text-text hover:border-primary"
        >
          ← {prev.englishName}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/surah/${next.number}/`}
          className="motion-fade rounded-md border border-border bg-base px-3 py-2 text-sm font-medium text-text hover:border-primary"
        >
          {next.englishName} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );

  if (!hydrated) {
    return (
      <div className="py-10 text-center text-sm text-muted" role="status">
        Memuat…
      </div>
    );
  }

  if (readingMode === "pager") {
    return (
      <div className="fixed inset-x-0 top-14 bottom-0 flex flex-col">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4">
          {header}
          {modeToggle}
        </div>

        <div
          ref={pagerRef}
          data-testid="verse-list"
          className="pager-scroll min-h-0 flex-1 overflow-y-auto"
        >
          {surah.ayahs.map((ayah, index) => (
            <section
              key={ayah.numberInSurah}
              data-index={index}
              className="pager-page mx-auto flex w-full max-w-3xl flex-col px-4"
              style={{ minHeight: "100%" }}
              aria-label={`Ayat ${ayah.numberInSurah}`}
            >
              {index === 0 ? bismillah : null}
              <div className="flex flex-1 flex-col justify-center py-6">
                <AyahCard
                  surah={surah}
                  ayah={ayah}
                  audioState={audio.stateFor(ayah.numberInSurah)}
                  onPlayAudio={() => audio.toggle(ayah.numberInSurah)}
                />
              </div>
            </section>
          ))}
          <div className="mx-auto w-full max-w-3xl px-4">{surahNav}</div>
        </div>

        <div className="pointer-events-none absolute top-20 right-4 rounded-md border border-border bg-base px-3 py-1 text-xs font-semibold text-primary">
          {currentIndex + 1} / {surah.ayahs.length}
        </div>

        <AudioPlayerBar audio={audio} surah={surah} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border">
        {header}
        <div className="py-4">{modeToggle}</div>
      </div>

      {bismillah}

      <div className="flex flex-col gap-4">
        {surah.ayahs.map((ayah, index) => (
          <div
            key={ayah.numberInSurah}
            id={`ayah-${surah.number}-${ayah.numberInSurah}`}
            data-ayah-block
            data-index={index}
            className="scroll-mt-20"
          >
            <AyahCard
              surah={surah}
              ayah={ayah}
              audioState={audio.stateFor(ayah.numberInSurah)}
              onPlayAudio={() => audio.toggle(ayah.numberInSurah)}
            />
          </div>
        ))}
      </div>

      {surahNav}
      <AudioPlayerBar audio={audio} surah={surah} />
    </div>
  );
}
