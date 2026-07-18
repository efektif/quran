export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  translationFootnotes?: string;
  juz: number;
  page: number;
  hizbQuarter: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  ayahs: Ayah[];
}

export interface QuranData {
  surahs: Surah[];
}
