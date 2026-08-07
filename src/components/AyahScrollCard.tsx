"use client";

import { useState } from "react";

import type { AyahAudioState } from "../lib/audio";
import { TAFSIR_BASE_URL } from "../lib/constants";
import { useQuranStore } from "../lib/store";
import type { Ayah, Surah } from "../lib/types";

interface AyahScrollCardProps {
  surah: Surah;
  ayah: Ayah;
  audioState: AyahAudioState;
  onPlayAudio: () => void;
}

/** Full-screen ayah for the TikTok-style "Scroll" feed: no card chrome,
 *  actions on a vertical rail, meta line floating at the bottom. */
export function AyahScrollCard({ surah, ayah, audioState, onPlayAudio }: AyahScrollCardProps) {
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
    <div className="relative flex flex-1 flex-col">
      <div className="no-scrollbar flex flex-1 flex-col justify-center overflow-y-auto px-4 py-10 pr-20">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-right text-4xl leading-[2.1] text-arabic"
        >
          {ayah.text}
          <span
            className="mx-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-double border-gold align-middle text-[1rem] text-gold"
            dir="ltr"
          >
            {toArabicIndic(ayah.numberInSurah)}
          </span>
        </p>

        <div className="mt-6 border-t-[3px] border-double border-border pt-4">
          {showId ? (
            <p className="text-[1rem] leading-7 text-text">{ayah.translationId}</p>
          ) : null}
          {showId && ayah.translationFootnotes ? (
            <p className="mt-2 border-l-2 border-gold/50 pl-3 text-xs leading-5 text-muted">
              {ayah.translationFootnotes}
            </p>
          ) : null}
          {showEn ? (
            <p className={`text-sm leading-6 text-muted italic ${showId ? "mt-3" : ""}`}>
              {ayah.translationEn}
            </p>
          ) : null}
        </div>
      </div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3">
        <RailButton
          onClick={onPlayAudio}
          active={audioState !== "idle"}
          label={
            audioState === "loading"
              ? `Memuat audio ayat ${ayah.numberInSurah}`
              : audioState === "playing"
                ? `Hentikan audio ayat ${ayah.numberInSurah}`
                : `Putar audio ayat ${ayah.numberInSurah}`
          }
          caption={audioState === "playing" ? "Berhenti" : "Dengar"}
        >
          {audioState === "playing" ? <StopIcon /> : <PlayIcon />}
        </RailButton>

        <RailButton
          onClick={() => toggleBookmark(surah.number, ayah.numberInSurah)}
          active={bookmarked}
          label={bookmarked ? "Hapus bookmark ayat ini" : "Bookmark ayat ini"}
          caption={bookmarked ? "Tersimpan" : "Bookmark"}
        >
          <BookmarkIcon filled={bookmarked} />
        </RailButton>

        <RailButton onClick={handleCopy} label="Salin ayat dan terjemahan" caption={copied ? "Tersalin" : "Salin"}>
          <CopyIcon />
        </RailButton>

        <a
          href={`${TAFSIR_BASE_URL}/${surah.number}/${ayah.numberInSurah}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Baca tafsir ${surah.englishName} ayat ${ayah.numberInSurah} di quran.com`}
          className="flex flex-col items-center gap-1 text-muted"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-base">
            <BookIcon />
          </span>
          <span className="text-[10px] font-semibold">Tafsir</span>
        </a>
      </div>

      <p className="absolute bottom-20 left-4 text-xs text-muted">
        {surah.englishName} {surah.number}:{ayah.numberInSurah} · Juz {ayah.juz} · Hal. {ayah.page}
      </p>
    </div>
  );
}

function RailButton({
  children,
  caption,
  onClick,
  label,
  active = false,
}: {
  children: React.ReactNode;
  caption: string;
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
      className="motion-fade flex flex-col items-center gap-1 text-muted"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full border ${
          active ? "border-primary bg-primary-soft text-primary" : "border-border bg-base text-text"
        }`}
      >
        {children}
      </span>
      <span className="text-[10px] font-semibold">{caption}</span>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 3h12v18l-6-4.5L6 21z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="12" height="12" />
      <path d="M5 15V3h12" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13" />
    </svg>
  );
}

function toArabicIndic(value: number): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value)
    .split("")
    .map((d) => digits[Number(d)])
    .join("");
}
