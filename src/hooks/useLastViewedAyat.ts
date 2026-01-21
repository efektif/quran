import { useCallback } from 'react';
import { storage } from '../utils/storage';

const STORAGE_KEY = 'lastViewedAyat';

export interface LastViewedAyat {
  surahNumber: number;
  ayahNumber: number; // 1-based (numberInSurah)
  timestamp: number;
}

export function useLastViewedAyat() {
  const getLastViewed = useCallback((): LastViewedAyat | null => {
    try {
      const value = storage.getString(STORAGE_KEY);
      if (!value) return null;
      return JSON.parse(value) as LastViewedAyat;
    } catch {
      return null;
    }
  }, []);

  const saveLastViewed = useCallback((surahNumber: number, ayahNumber: number): void => {
    const data: LastViewedAyat = {
      surahNumber,
      ayahNumber,
      timestamp: Date.now(),
    };
    storage.set(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const clearLastViewed = useCallback((): void => {
    storage.remove(STORAGE_KEY);
  }, []);

  return {
    getLastViewed,
    saveLastViewed,
    clearLastViewed,
  };
}
