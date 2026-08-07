export function getInitialVerseIndex(startAyah: number, verseCount: number): number {
  if (verseCount <= 0) return 0;

  const requestedIndex = Number.isFinite(startAyah) ? Math.trunc(startAyah) - 1 : 0;
  return Math.min(Math.max(requestedIndex, 0), verseCount - 1);
}
