/*
 * Service worker: offline reading for the static export.
 *
 * - Navigations: network-first, falling back to cache (and finally the home
 *   shell) so users always get fresh pages when online.
 * - /data/*.json: cache-first (content is immutable per release); the
 *   "Unduh semua data" action pre-fills quran-data-v1 with all surahs.
 * - Fonts and everyayah audio: cache-first runtime caching.
 */
const SHELL_CACHE = "quran-shell-v1";
const DATA_CACHE = "quran-data-v1";
const RUNTIME_CACHE = "quran-runtime-v1";

const SHELL_URLS = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-1024.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, DATA_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  });
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shell = await caches.open(SHELL_CACHE);
    return (await shell.match("/index.html")) ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/data/")) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "everyayah.com"
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  }
});
