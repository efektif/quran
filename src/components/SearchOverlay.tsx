"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SURAH_INDEX } from "../data/surah-index";
import { filterSearchIndex, makeSnippet, type SearchResult } from "../lib/search";
import type { SearchIndexEntry } from "../lib/types";

// Fetched once per session; the index is ~3MB so it only loads on demand.
let indexCache: SearchIndexEntry[] | null = null;

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const openOverlay = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        openOverlay();
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openOverlay]);

  useEffect(() => {
    const handler = () => openOverlay();
    window.addEventListener("quran:open-search", handler);
    return () => window.removeEventListener("quran:open-search", handler);
  }, [openOverlay]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    // Every open path (Ctrl+K, "/", header button) lands here, so the lazy
    // index fetch lives in this effect rather than in one trigger.
    if (!indexCache) {
      setLoading(true);
      fetch("/data/search-index.json")
        .then((res) => res.json())
        .then((data: SearchIndexEntry[]) => {
          indexCache = data;
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open]);

  // Depends on `loading` too: the query can arrive while the index fetch is
  // still in flight, and only the loading flip makes the index available.
  useEffect(() => {
    if (!indexCache) return;
    const next = filterSearchIndex(indexCache, query);
    setResults(next);
    setActiveIndex(0);
  }, [query, loading]);

  const goTo = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      router.push(`/surah/${result.entry.s}/?ayat=${result.entry.a}`);
    },
    [router],
  );

  const handleInputKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      goTo(results[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian ayat"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-sm border-2 border-border bg-base"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0 text-muted"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Cari ayat (Indonesia, English, atau Arab)…"
            aria-label="Cari ayat"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            role="combobox"
            className="h-12 w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
          <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
            Esc
          </kbd>
        </div>

        <div id="search-results" role="listbox" className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted" role="status">
              Memuat indeks pencarian…
            </p>
          ) : null}

          {!loading && query.trim().length >= 2 && results.length === 0 ? (
            <p className="p-4 text-sm text-muted">Tidak ada hasil untuk “{query}”.</p>
          ) : null}

          {results.map((result, index) => {
            const meta = SURAH_INDEX[result.entry.s - 1];
            const text =
              result.field === "ar"
                ? result.entry.ar
                : result.field === "id"
                  ? result.entry.id
                  : result.entry.en;
            return (
              <button
                key={`${result.entry.s}:${result.entry.a}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => goTo(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`motion-fade block w-full px-4 py-3 text-left ${
                  index === activeIndex ? "bg-primary-soft" : ""
                }`}
              >
                <span className="mb-0.5 block text-xs font-bold text-primary">
                  {meta?.englishName} {result.entry.s}:{result.entry.a}
                </span>
                <span
                  className={`block text-sm leading-6 text-text ${result.field === "ar" ? "font-arabic text-right text-base" : ""}`}
                  dir={result.field === "ar" ? "rtl" : "ltr"}
                >
                  {makeSnippet(text, result.offset, query.trim().length)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Imperative trigger so any button can open the overlay. */
export function openSearchOverlay(): void {
  window.dispatchEvent(new Event("quran:open-search"));
}
