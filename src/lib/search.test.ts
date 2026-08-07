import { describe, expect, it } from "vitest";

import { filterSearchIndex, makeSnippet } from "./search";
import type { SearchIndexEntry } from "./types";

const entries: SearchIndexEntry[] = [
  {
    s: 1,
    a: 1,
    ar: "بسم الله الرحمن الرحيم",
    id: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.",
    en: "In the Name of Allah—the Most Compassionate, Most Merciful.",
  },
  {
    s: 2,
    a: 255,
    ar: "الله لا اله الا هو الحي القيوم",
    id: "Allah, tidak ada tuhan selain Dia, Yang Hidup kekal lagi terus menerus mengurus makhluk-Nya.",
    en: "Allah! There is no god worthy of worship except Him, the Ever-Living, All-Sustaining.",
  },
  {
    s: 18,
    a: 10,
    ar: "اذ اوى الفتيه الى الكهف",
    id: "Ketika para pemuda itu berlindung ke dalam gua (Al-Kahf).",
    en: "When the youths sought refuge in the Cave.",
  },
];

describe("filterSearchIndex", () => {
  it("returns nothing for queries shorter than two characters", () => {
    expect(filterSearchIndex(entries, "a")).toEqual([]);
    expect(filterSearchIndex(entries, " ")).toEqual([]);
  });

  it("matches Arabic queries against the normalized Arabic field", () => {
    // Query with full diacritics must match the stripped index entry.
    const results = filterSearchIndex(entries, "الْكَهْفِ");
    expect(results).toHaveLength(1);
    expect(results[0].field).toBe("ar");
    expect(results[0].entry.s).toBe(18);
  });

  it("matches Latin queries against Indonesian first, then English", () => {
    const results = filterSearchIndex(entries, "Allah");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every((r) => r.field === "id")).toBe(true);
  });

  it("falls back to the English field when only English matches", () => {
    const results = filterSearchIndex(entries, "Cave");
    expect(results).toHaveLength(1);
    expect(results[0].field).toBe("en");
    expect(results[0].entry.s).toBe(18);
  });

  it("is case-insensitive for Latin queries", () => {
    expect(filterSearchIndex(entries, "ever-living")).toHaveLength(1);
  });

  it("respects the limit", () => {
    expect(filterSearchIndex(entries, "Allah", 1)).toHaveLength(1);
  });
});

describe("makeSnippet", () => {
  it("returns the whole text when it fits the radius", () => {
    expect(makeSnippet("short text", 0, 5, 60)).toBe("short text");
  });

  it("adds ellipses when the match sits deep inside a long text", () => {
    const text = `${"a".repeat(200)}match${"b".repeat(200)}`;
    const snippet = makeSnippet(text, 200, 5, 20);
    expect(snippet.startsWith("…")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet).toContain("match");
  });

  it("omits the leading ellipsis at the start of the text", () => {
    const text = `match${"b".repeat(200)}`;
    const snippet = makeSnippet(text, 0, 5, 20);
    expect(snippet.startsWith("match")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
  });
});
