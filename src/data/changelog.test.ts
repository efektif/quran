import { describe, expect, test } from "vitest";

import { CHANGELOG_RELEASES } from "./changelog";

describe("Changelog releases", () => {
  test("has dated entries with at least one item each", () => {
    expect(CHANGELOG_RELEASES.length).toBeGreaterThan(0);
    expect(
      CHANGELOG_RELEASES.every(
        ({ date, items }) => /^\d{4}-\d{2}-\d{2}$/.test(date) && items.length > 0,
      ),
    ).toBe(true);
  });

  test("is ordered newest first", () => {
    const dates = CHANGELOG_RELEASES.map(({ date }) => date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });
});
