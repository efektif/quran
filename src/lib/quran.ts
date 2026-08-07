import { readFile } from "node:fs/promises";
import path from "node:path";

import type { JuzStart, Surah } from "./types";

/**
 * Server-side data access. Pages are statically generated, so per-surah JSON
 * is read from disk at build time — never bundled client-side wholesale.
 */

const DATA_DIR = path.join(process.cwd(), "public", "data");

export async function getSurah(number: number): Promise<Surah> {
  const raw = await readFile(path.join(DATA_DIR, "surah", `${number}.json`), "utf8");
  return JSON.parse(raw) as Surah;
}

export async function getJuzMap(): Promise<JuzStart[]> {
  const raw = await readFile(path.join(DATA_DIR, "juz-map.json"), "utf8");
  return JSON.parse(raw) as JuzStart[];
}

export function isValidSurahNumber(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 114;
}
