import { normalizeArabic } from "./arabic";
import type { SearchIndexEntry } from "./types";

export interface SearchResult {
  entry: SearchIndexEntry;
  /** Which field matched, drives snippet rendering. */
  field: "ar" | "id" | "en";
  /** Character offset of the match inside the field's text. */
  offset: number;
}

const ARABIC_PATTERN = /[؀-ۿ]/;

/**
 * Substring search over the prebuilt index. Arabic queries match the
 * normalized Arabic text; Latin queries match both translations.
 * Results are ranked by match position so earlier-in-ayah hits win.
 */
export function filterSearchIndex(
  entries: SearchIndexEntry[],
  query: string,
  limit = 30,
): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const results: SearchResult[] = [];

  if (ARABIC_PATTERN.test(trimmed)) {
    const normalizedQuery = normalizeArabic(trimmed);
    for (const entry of entries) {
      const offset = entry.ar.indexOf(normalizedQuery);
      if (offset >= 0) results.push({ entry, field: "ar", offset });
      if (results.length >= limit) break;
    }
    return results;
  }

  const lowerQuery = trimmed.toLowerCase();
  for (const entry of entries) {
    const idOffset = entry.id.toLowerCase().indexOf(lowerQuery);
    const enOffset = entry.en.toLowerCase().indexOf(lowerQuery);
    if (idOffset >= 0 && (enOffset < 0 || idOffset <= enOffset)) {
      results.push({ entry, field: "id", offset: idOffset });
    } else if (enOffset >= 0) {
      results.push({ entry, field: "en", offset: enOffset });
    }
    if (results.length >= limit) break;
  }
  return results;
}

/** Short excerpt around a match for result lists. */
export function makeSnippet(
  text: string,
  offset: number,
  queryLength: number,
  radius = 60,
): string {
  const start = Math.max(0, offset - radius);
  const end = Math.min(text.length, offset + queryLength + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
