import { describe, expect, test } from "vitest";

import { normalizeArabic, stripBismillahPrefix } from "./arabic";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

describe("normalizeArabic", () => {
  test("strips tashkeel and tatweel", () => {
    expect(normalizeArabic("ٱلرَّحْمَٰنِ")).toBe("الرحمن");
    expect(normalizeArabic("مُحَمَّد")).toBe("محمد");
  });

  test("unifies alef and hamza variants", () => {
    expect(normalizeArabic("أإآٱا")).toBe("ااااا");
  });

  test("unifies ta marbuta and alef maqsurah", () => {
    expect(normalizeArabic("رحمة")).toBe(normalizeArabic("رحمه"));
    expect(normalizeArabic("هدى")).toBe(normalizeArabic("هدي"));
  });

  test("collapses whitespace", () => {
    expect(normalizeArabic("  بِسْمِ   ٱللَّهِ  ")).toBe("بسم الله");
  });
});

describe("stripBismillahPrefix", () => {
  test("strips the prefix from ayah 1 of regular surahs", () => {
    expect(stripBismillahPrefix(2, 1, `${BISMILLAH} الٓمٓ`, BISMILLAH)).toBe("الٓمٓ");
  });

  test("keeps surah 1 ayah 1 intact (it is the bismillah)", () => {
    expect(stripBismillahPrefix(1, 1, BISMILLAH, BISMILLAH)).toBe(BISMILLAH);
  });

  test("keeps surah 9 ayah 1 intact (no bismillah revealed)", () => {
    const text = "بَرَآءَةٌۭ مِّنَ ٱللَّهِ";
    expect(stripBismillahPrefix(9, 1, text, BISMILLAH)).toBe(text);
  });

  test("never strips non-opening ayahs", () => {
    const text = `${BISMILLAH} something`;
    expect(stripBismillahPrefix(2, 2, text, BISMILLAH)).toBe(text);
  });

  test("removes a BOM left by the API", () => {
    expect(stripBismillahPrefix(1, 1, `﻿${BISMILLAH}`, BISMILLAH)).toBe(BISMILLAH);
  });
});
