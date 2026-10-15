import type { MetadataRoute } from "next";

import { SURAH_INDEX } from "../src/data/surah-index";
import { SITE_URL } from "../src/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // trailingSlash: true — keep URLs identical to the exported directories.
  const paths = [
    "/",
    "/sholat/",
    "/changelog/",
    ...SURAH_INDEX.map((surah) => `/surah/${surah.number}/`),
    ...Array.from({ length: 30 }, (_, i) => `/juz/${i + 1}/`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
