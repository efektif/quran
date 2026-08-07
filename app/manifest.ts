import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Al-Quran — Efektif",
    short_name: "Al-Quran",
    description:
      "Baca Al-Quran dengan terjemahan Kemenag RI dan English, audio per ayat, bookmark, dan jadwal sholat.",
    start_url: "/",
    display: "standalone",
    background_color: "#090b0f",
    theme_color: "#6e7bff",
    lang: "id",
    icons: [
      { src: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { src: "/icons/icon-1024.png", sizes: "1024x1024", type: "image/png" },
      { src: "/icons/icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
  };
}
