import type { Metadata } from "next";

import { BookmarksClient } from "../../src/components/BookmarksClient";

export const metadata: Metadata = {
  title: "Bookmark",
  description: "Ayat-ayat yang kamu simpan untuk dibaca kembali.",
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
