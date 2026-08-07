import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

/**
 * Minimal static server for the exported site (out/). Used by `pnpm start`
 * and the Playwright webServer so e2e tests run against the real export.
 */

const ROOT = path.join(process.cwd(), "out");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4310);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const safe = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safe);
  if (!filePath.startsWith(ROOT)) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!existsSync(filePath) && !path.extname(filePath)) {
    filePath += ".html";
  }
  return existsSync(filePath) && statSync(filePath).isFile() ? filePath : null;
}

const server = createServer((req, res) => {
  const filePath = resolveFile(req.url ?? "/");
  if (!filePath) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(filePath)] ?? "application/octet-stream" });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Serving out/ at http://127.0.0.1:${PORT}`);
});
