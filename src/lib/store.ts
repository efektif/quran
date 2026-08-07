"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";
export type TranslationMode = "id" | "en" | "both";
export type ReadingMode = "pager" | "mushaf";

export interface Bookmark {
  surah: number;
  ayah: number;
  createdAt: number;
}

export interface LastViewed {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface SholatLocation {
  label: string;
  latitude: number;
  longitude: number;
  /** IANA timezone of the location, e.g. Asia/Jakarta. */
  timezone: string;
}

interface QuranState {
  theme: Theme;
  setTheme: (theme: Theme) => void;

  translationMode: TranslationMode;
  setTranslationMode: (mode: TranslationMode) => void;

  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;

  bookmarks: Bookmark[];
  toggleBookmark: (surah: number, ayah: number) => void;

  lastViewed: LastViewed | null;
  setLastViewed: (surahNumber: number, ayahNumber: number) => void;

  /** Date-keyed (YYYY-MM-DD) sets of "surah:ayah" read, for weekly stats. */
  readingLog: Record<string, string[]>;
  logAyahRead: (surahNumber: number, ayahNumber: number, dayKey: string) => void;

  alKahfDismissedDay: string | null;
  dismissAlKahf: (dayKey: string) => void;

  location: SholatLocation | null;
  setLocation: (location: SholatLocation) => void;

  /** Calculation method id from @masaajid/prayer-times (default Kemenag). */
  sholatMethod: string;
  setSholatMethod: (method: string) => void;

  audioAutoAdvance: boolean;
  setAudioAutoAdvance: (value: boolean) => void;
}

export const STORE_STORAGE_KEY = "quran-store";

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      // Classic mushaf look: light paper is the default profile.
      theme: "light",
      setTheme: (theme) => set({ theme }),

      translationMode: "id",
      setTranslationMode: (translationMode) => set({ translationMode }),

      readingMode: "mushaf",
      setReadingMode: (readingMode) => set({ readingMode }),

      bookmarks: [],
      toggleBookmark: (surah, ayah) => {
        const existing = get().bookmarks;
        const found = existing.some((b) => b.surah === surah && b.ayah === ayah);
        set({
          bookmarks: found
            ? existing.filter((b) => !(b.surah === surah && b.ayah === ayah))
            : [...existing, { surah, ayah, createdAt: Date.now() }],
        });
      },

      lastViewed: null,
      setLastViewed: (surahNumber, ayahNumber) =>
        set({ lastViewed: { surahNumber, ayahNumber, timestamp: Date.now() } }),

      readingLog: {},
      logAyahRead: (surahNumber, ayahNumber, dayKey) => {
        const key = `${surahNumber}:${ayahNumber}`;
        const log = get().readingLog;
        const day = log[dayKey] ?? [];
        if (day.includes(key)) return;
        // Keep at most the last 14 days to bound storage growth.
        const entries = Object.entries(log)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 13);
        set({
          readingLog: {
            ...Object.fromEntries(entries),
            [dayKey]: [...day, key],
          },
        });
      },

      alKahfDismissedDay: null,
      dismissAlKahf: (dayKey) => set({ alKahfDismissedDay: dayKey }),

      location: null,
      setLocation: (location) => set({ location }),

      sholatMethod: "Kemenag",
      setSholatMethod: (sholatMethod) => set({ sholatMethod }),

      audioAutoAdvance: true,
      setAudioAutoAdvance: (audioAutoAdvance) => set({ audioAutoAdvance }),
    }),
    {
      name: STORE_STORAGE_KEY,
      // Static export: markup is pre-rendered, so localStorage must not be
      // read during SSR. Components gate on useHasHydrated() below.
      skipHydration: true,
    },
  ),
);

/** Set once localStorage rehydration finishes; gates store-dependent UI. */
export const useHydrationStore = create<{ hydrated: boolean }>(() => ({ hydrated: false }));

export function useHasHydrated(): boolean {
  return useHydrationStore((state) => state.hydrated);
}

export async function rehydrateStore(): Promise<void> {
  try {
    await useQuranStore.persist.rehydrate();
  } finally {
    useHydrationStore.setState({ hydrated: true });
  }
}
