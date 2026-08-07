"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuranStore } from "./store";

export type AyahAudioState = "idle" | "loading" | "playing";

/**
 * everyayah.com per-ayah MP3: surah and ayah zero-padded to 3 digits.
 * Reciter: Mishary Rashid Alafasy, 128kbps.
 */
export function buildAyahAudioUrl(surahNumber: number, ayahNumber: number): string {
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`;
}

export interface AudioPlayer {
  currentAyah: number | null;
  state: AyahAudioState;
  failed: boolean;
  toggle: (ayahNumber: number) => void;
  play: (ayahNumber: number) => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  stateFor: (ayahNumber: number) => AyahAudioState;
}

/** Shared per-ayah audio with optional auto-advance within the surah. */
export function useAudioPlayer(surahNumber: number, ayahCount: number): AudioPlayer {
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const [state, setState] = useState<AyahAudioState>("idle");
  const [failed, setFailed] = useState(false);
  const elementRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    elementRef.current?.pause();
    elementRef.current = null;
    setCurrentAyah(null);
    setState("idle");
  }, []);

  const play = useCallback(
    (ayahNumber: number) => {
      if (ayahNumber < 1 || ayahNumber > ayahCount) return;
      elementRef.current?.pause();

      const audio = new Audio(buildAyahAudioUrl(surahNumber, ayahNumber));
      elementRef.current = audio;
      setCurrentAyah(ayahNumber);
      setState("loading");
      setFailed(false);

      audio.addEventListener("playing", () => setState("playing"));
      audio.addEventListener("error", () => {
        setState("idle");
        setFailed(true);
      });
      audio.addEventListener("ended", () => {
        setState("idle");
        if (useQuranStore.getState().audioAutoAdvance && ayahNumber < ayahCount) {
          play(ayahNumber + 1);
        } else {
          setCurrentAyah(null);
        }
      });

      void audio.play().catch(() => {
        setState("idle");
        setFailed(true);
      });
    },
    [surahNumber, ayahCount],
  );

  const toggle = useCallback(
    (ayahNumber: number) => {
      if (currentAyah === ayahNumber && state !== "idle") {
        stop();
      } else {
        play(ayahNumber);
      }
    },
    [currentAyah, state, play, stop],
  );

  const next = useCallback(() => {
    if (currentAyah !== null && currentAyah < ayahCount) play(currentAyah + 1);
  }, [currentAyah, ayahCount, play]);

  const prev = useCallback(() => {
    if (currentAyah !== null && currentAyah > 1) play(currentAyah - 1);
  }, [currentAyah, play]);

  useEffect(() => stop, [stop]);

  const stateFor = useCallback(
    (ayahNumber: number): AyahAudioState => (currentAyah === ayahNumber ? state : "idle"),
    [currentAyah, state],
  );

  return useMemo(
    () => ({ currentAyah, state, failed, toggle, play, stop, next, prev, stateFor }),
    [currentAyah, state, failed, toggle, play, stop, next, prev, stateFor],
  );
}
