/**
 * Arabic text normalization for search. Shared by the data pipeline
 * (index build) and the client (query normalization) so both sides agree.
 *
 * Strips tashkeel/tatweel and unifies letter variants so a query like
 * "الرحمن" matches "ٱلرَّحْمَٰنِ".
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٰٟۖ-ۭ﻿]/g, "")
    .replace(/[أإآٱﺍ]/g, "ا")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The quran-uthmani edition prefixes ayah 1 of every surah (except 1, where
 * it is the ayah itself, and 9, which has none) with the bismillah. The
 * reader renders its own bismillah header, so the prefix is stripped here to
 * avoid showing it twice.
 *
 * The bismillah string is not hardcoded: its exact codepoints vary between
 * text editions, so callers pass the canonical string taken from surah 1:1
 * of the same edition.
 */
export function stripBismillahPrefix(
  surahNumber: number,
  numberInSurah: number,
  text: string,
  bismillah: string,
): string {
  const withoutBom = text.replace(/^﻿/, "");
  if (surahNumber === 1 || surahNumber === 9 || numberInSurah !== 1) return withoutBom;
  if (!withoutBom.startsWith(bismillah)) return withoutBom;
  return withoutBom.slice(bismillah.length).trim();
}
