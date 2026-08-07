"use client";

import { useState } from "react";

import type { AyahAudioState } from "../lib/audio";
import { TAFSIR_BASE_URL } from "../lib/constants";
import { useQuranStore } from "../lib/store";
import type { Ayah, Surah } from "../lib/types";

interface AyahCardProps {
  surah: Surah;
  ayah: Ayah;
  audioState: AyahAudioState;
  onPlayAudio: () => void;
}

export function AyahCard({ surah, ayah, audioState, onPlayAudio }: AyahCardProps) {
  const translationMode = useQuranStore((state) => state.translationMode);
  const bookmarks = useQuranStore((state) => state.bookmarks);
  const toggleBookmark = useQuranStore((state) => state.toggleBookmark);
  const [copied, setCopied] = useState(false);

  const bookmarked = bookmarks.some(
    (b) => b.surah === surah.number && b.ayah === ayah.numberInSurah,
  );
  const showId = translationMode === "id" || translationMode === "both";
  const showEn = translationMode === "en" || translationMode === "both";

  const handleCopy = async () => {
    const parts = [ayah.text, ayah.translationId, ayah.translationEn].filter(Boolean);
    try {
      await navigator.clipboard.writeText(parts.join("\n\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (permission denied); nothing to copy silently.
    }
  };

  return (
    <article className="rounded-lg border border-border bg-base p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
          {surah.englishName} {surah.number}:{ayah.numberInSurah}
        </span>
        <span className="text-xs text-muted">
          Juz {ayah.juz} / Hal. {ayah.page}
        </span>
      </div>

      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-right text-3xl leading-[2.2] text-arabic sm:text-4xl sm:leading-[2.2]"
      >
        {ayah.text}
        <span
          className="mx-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border align-middle text-sm text-primary"
          dir="ltr"
        >
          {toArabicIndic(ayah.numberInSurah)}
        </span>
      </p>

      <div className="mt-5 border-t border-border pt-4">
        {showId ? (
          <div className={showEn ? "mb-4" : undefined}>
            <p className="mb-1.5 text-[11px] font-bold tracking-wide text-primary uppercase">
              Terjemahan Kemenag RI
            </p>
            <p className="text-base leading-7 text-text">{ayah.translationId}</p>
            {ayah.translationFootnotes ? (
              <p className="mt-2 text-xs leading-5 text-muted">{ayah.translationFootnotes}</p>
            ) : null}
          </div>
        ) : null}

        {showEn ? (
          <div>
            <p className="mb-1.5 text-[11px] font-bold tracking-wide text-primary uppercase">
              Saheeh International
            </p>
            <p className="text-base leading-7 text-text">{ayah.translationEn}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ActionButton
          onClick={onPlayAudio}
          active={audioState !== "idle"}
          label={
            audioState === "loading"
              ? `Memuat audio ayat ${ayah.numberInSurah}`
              : audioState === "playing"
                ? `Hentikan audio ayat ${ayah.numberInSurah}`
                : `Putar audio ayat ${ayah.numberInSurah}`
          }
        >
          {audioState === "playing" ? "Berhenti" : audioState === "loading" ? "Memuat…" : "Dengar"}
        </ActionButton>

        <ActionButton
          onClick={() => toggleBookmark(surah.number, ayah.numberInSurah)}
          active={bookmarked}
          label={bookmarked ? "Hapus bookmark ayat ini" : "Bookmark ayat ini"}
        >
          {bookmarked ? "Tersimpan" : "Bookmark"}
        </ActionButton>

        <ActionButton onClick={handleCopy} label="Salin ayat dan terjemahan">
          {copied ? "Tersalin" : "Salin"}
        </ActionButton>

        <a
          href={`${TAFSIR_BASE_URL}/${surah.number}/${ayah.numberInSurah}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Baca tafsir ${surah.englishName} ayat ${ayah.numberInSurah} di quran.com`}
          className="motion-fade rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:border-primary hover:text-text"
        >
          Tafsir ↗
        </a>
      </div>
    </article>
  );
}

function ActionButton({
  children,
  onClick,
  label,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`motion-fade rounded-md border px-3 py-1.5 text-xs font-semibold ${
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border text-muted hover:border-primary hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function toArabicIndic(value: number): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value)
    .split("")
    .map((d) => digits[Number(d)])
    .join("");
}
