"use client";

import type { AudioPlayer } from "../lib/audio";
import { useQuranStore } from "../lib/store";
import type { Surah } from "../lib/types";

interface AudioPlayerBarProps {
  audio: AudioPlayer;
  surah: Surah;
}

export function AudioPlayerBar({ audio, surah }: AudioPlayerBarProps) {
  const autoAdvance = useQuranStore((state) => state.audioAutoAdvance);
  const setAutoAdvance = useQuranStore((state) => state.setAudioAutoAdvance);

  if (audio.currentAyah === null && !audio.failed) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-double border-gold/70 bg-primary text-on-primary"
      role="region"
      aria-label="Pemutar audio"
    >
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
        {audio.failed && audio.currentAyah === null ? (
          <p className="flex-1 text-xs text-on-primary/80">
            Audio tidak tersedia saat ini. Periksa koneksi internet.
          </p>
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm font-medium">
            {surah.englishName} — Ayat {audio.currentAyah}
            <span className="ml-2 text-xs text-on-primary/70">
              {audio.state === "loading" ? "memuat…" : "Alafasy"}
            </span>
          </p>
        )}

        <button
          type="button"
          onClick={audio.prev}
          disabled={audio.currentAyah === null || audio.currentAyah <= 1}
          aria-label="Ayat sebelumnya"
          className="motion-fade flex h-9 w-9 items-center justify-center rounded-sm border border-on-primary/40 text-on-primary/90 hover:bg-on-primary/10 disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 5h2v14H6zM20 5v14L9.5 12z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={audio.stop}
          aria-label="Tutup pemutar"
          className="motion-fade flex h-9 w-9 items-center justify-center rounded-sm border border-on-primary/40 text-on-primary/90 hover:bg-on-primary/10"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        <button
          type="button"
          onClick={audio.next}
          disabled={audio.currentAyah === null || audio.currentAyah >= surah.numberOfAyahs}
          aria-label="Ayat berikutnya"
          className="motion-fade flex h-9 w-9 items-center justify-center rounded-sm border border-on-primary/40 text-on-primary/90 hover:bg-on-primary/10 disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M16 5h2v14h-2zM4 5v14l10.5-7z" />
          </svg>
        </button>

        <label className="ml-1 flex items-center gap-1.5 text-xs text-on-primary/80 select-none">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(event) => setAutoAdvance(event.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          Lanjut otomatis
        </label>
      </div>
    </div>
  );
}
