export interface Ayah {
  /** Global ayah number (1-6236). */
  number: number;
  /** 1-based ayah number within its surah. */
  numberInSurah: number;
  /** Uthmani Arabic text. Bismillah prefix is stripped from ayah 1 of surahs other than 1 and 9. */
  text: string;
  /** Terjemahan Kementerian Agama RI (QuranEnc indonesian_affairs). */
  translationId: string;
  translationFootnotes?: string;
  /** Saheeh International English translation. */
  translationEn: string;
  juz: number;
  page: number;
  hizbQuarter: number;
}

export interface Surah extends SurahMeta {
  ayahs: Ayah[];
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  /** Mushaf page where the surah starts. */
  startPage: number;
}

/** First ayah of each juz, for juz navigation. */
export interface JuzStart {
  juz: number;
  surahNumber: number;
  ayahNumber: number;
  surahEnglishName: string;
}

/** Flat search record; Arabic is pre-normalized (diacritics stripped). */
export interface SearchIndexEntry {
  /** Surah number. */
  s: number;
  /** numberInSurah. */
  a: number;
  ar: string;
  id: string;
  en: string;
}
