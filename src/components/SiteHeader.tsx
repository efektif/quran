"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ABOUT_URL } from "../lib/constants";
import { useHasHydrated, useQuranStore, type TranslationMode } from "../lib/store";
import { openSearchOverlay } from "./SearchOverlay";

const NAV_ITEMS = [
  { href: "/", label: "Surah" },
  { href: "/bookmarks/", label: "Bookmark" },
  { href: "/sholat/", label: "Sholat" },
  { href: "/changelog/", label: "Changelog" },
] as const;

const TRANSLATION_OPTIONS: { value: TranslationMode; label: string }[] = [
  { value: "id", label: "Indonesia (Kemenag)" },
  { value: "en", label: "English (Saheeh)" },
  { value: "both", label: "ID + EN" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const theme = useQuranStore((state) => state.theme);
  const setTheme = useQuranStore((state) => state.setTheme);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
        <Link href="/" className="font-arabic text-xl text-primary" aria-label="Al-Quran — beranda">
          Al-Quran
        </Link>

        <nav className="ml-2 flex flex-1 items-center gap-1" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`motion-fade rounded-md px-2.5 py-1.5 text-sm font-medium ${
                  active ? "bg-primary-soft text-primary" : "text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={openSearchOverlay}
          aria-label="Cari ayat (Ctrl+K)"
          className="motion-fade flex h-9 w-9 items-center justify-center rounded-md border border-border bg-base text-muted hover:text-text"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>

        <SettingsMenu />

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          className="motion-fade flex h-9 w-9 items-center justify-center rounded-md border border-border bg-base text-muted hover:text-text"
        >
          {hydrated && theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
}

function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "working" | "done" | "error">("idle");
  const menuRef = useRef<HTMLDivElement>(null);
  const translationMode = useQuranStore((state) => state.translationMode);
  const setTranslationMode = useQuranStore((state) => state.setTranslationMode);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const downloadOfflineData = async () => {
    if (!("caches" in window)) {
      setDownloadState("error");
      return;
    }
    setDownloadState("working");
    try {
      const cache = await caches.open("quran-data-v1");
      await cache.add("/data/juz-map.json");
      await Promise.all(
        Array.from({ length: 114 }, (_, index) => cache.add(`/data/surah/${index + 1}.json`)),
      );
      setDownloadState("done");
    } catch {
      setDownloadState("error");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Pengaturan"
        aria-expanded={open}
        className="motion-fade flex h-9 w-9 items-center justify-center rounded-md border border-border bg-base text-muted hover:text-text"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-base p-3 shadow-lg">
          <p className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">
            Terjemahan
          </p>
          <div className="mb-3 flex flex-col gap-1" role="radiogroup" aria-label="Mode terjemahan">
            {TRANSLATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={translationMode === option.value}
                onClick={() => setTranslationMode(option.value)}
                className={`motion-fade rounded-md px-3 py-2 text-left text-sm font-medium ${
                  translationMode === option.value
                    ? "bg-primary-soft text-primary"
                    : "text-text hover:bg-surface"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Offline</p>
          <button
            type="button"
            onClick={downloadOfflineData}
            disabled={downloadState === "working"}
            className="motion-fade mb-3 w-full rounded-md border border-border px-3 py-2 text-left text-sm font-medium text-text hover:border-primary disabled:opacity-50"
          >
            {downloadState === "working"
              ? "Mengunduh 114 surah…"
              : downloadState === "done"
                ? "Data offline tersimpan"
                : downloadState === "error"
                  ? "Gagal — coba lagi"
                  : "Unduh semua data (±7 MB)"}
          </button>

          <a
            href={ABOUT_URL}
            target="_blank"
            rel="noreferrer"
            className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-text"
          >
            Tentang ↗
          </a>
        </div>
      ) : null}
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
