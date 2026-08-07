import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SearchOverlay } from "../src/components/SearchOverlay";
import { ServiceWorkerRegistrar } from "../src/components/ServiceWorkerRegistrar";
import { SiteHeader } from "../src/components/SiteHeader";
import { StoreHydrator } from "../src/components/StoreHydrator";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Al-Quran",
    template: "%s — Al-Quran",
  },
  description:
    "Baca Al-Quran dengan terjemahan Kemenag RI dan English, audio per ayat, bookmark, dan jadwal sholat.",
  icons: {
    icon: "/icons/favicon-64.png",
    apple: "/icons/icon-1024.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090b0f" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Applies the persisted theme before first paint. Dark is the System One
 * default, so only an explicit "light" choice flips the attribute.
 */
const themeBootstrap = `(function(){try{var s=JSON.parse(localStorage.getItem("quran-store")||"{}");var t=s.state&&s.state.theme;document.documentElement.dataset.theme=t==="light"?"light":"dark";}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-canvas text-text">
        <StoreHydrator />
        <ServiceWorkerRegistrar />
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-4 pb-24">{children}</main>
        <SearchOverlay />
      </body>
    </html>
  );
}
