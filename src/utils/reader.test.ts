import { describe, expect, it } from "vitest";

import { getInitialVerseIndex } from "./reader";

describe("getInitialVerseIndex", () => {
  it("converts one-based ayah numbers to zero-based indexes", () => {
    expect(getInitialVerseIndex(1, 7)).toBe(0);
    expect(getInitialVerseIndex(5, 7)).toBe(4);
  });

  it("clamps stale or malformed progress to the available verses", () => {
    expect(getInitialVerseIndex(99, 7)).toBe(6);
    expect(getInitialVerseIndex(-3, 7)).toBe(0);
    expect(getInitialVerseIndex(Number.NaN, 7)).toBe(0);
    expect(getInitialVerseIndex(3, 0)).toBe(0);
  });
});
