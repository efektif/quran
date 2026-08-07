"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useHasHydrated, useQuranStore } from "../lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Surah" },
  { href: "/bookmarks/", label: "Bookmark" },
  { href: "/sholat/", label: "Sholat" },
  { href: "/changelog/", label: "Changelog" },
] as const;

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
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          className="motion-fade flex h-9 w-9 items-center justify-center rounded-md border border-border bg-base text-muted hover:text-text"
        >
          {/* Render a stable icon before hydration to avoid mismatch. */}
          {hydrated && theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
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
