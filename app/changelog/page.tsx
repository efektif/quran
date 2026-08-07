import type { Metadata } from "next";

import { CHANGELOG_RELEASES } from "../../src/data/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Riwayat pembaruan aplikasi Al-Quran.",
};

export default function ChangelogPage() {
  return (
    <div className="py-6">
      <h1 className="font-display text-2xl font-bold text-text">Changelog</h1>
      <p className="mt-1 text-sm text-muted">Pembaruan produk, terbaru di atas.</p>

      <div className="mt-6 flex flex-col gap-6">
        {CHANGELOG_RELEASES.map((release) => (
          <section
            key={release.date}
            aria-label={`Rilis ${release.date}`}
            className="rounded-sm border border-border bg-base p-5"
          >
            <h2 className="font-display text-sm font-bold text-primary">{release.date}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {release.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-text">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
