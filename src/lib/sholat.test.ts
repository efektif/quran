import { CalculationParameters, Coordinates, PrayerTimes } from "adhan";
import { describe, expect, test } from "vitest";

import {
  dateKeyInZone,
  formatCountdown,
  formatTimeInZone,
  getMonthlyTimes,
  getNextPrayer,
  getPrayerTimes,
  PRAYER_KEYS,
} from "./sholat";
import type { SholatLocation } from "./store";

const JAKARTA: SholatLocation = {
  label: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "Asia/Jakarta",
};

const MAKASSAR: SholatLocation = {
  label: "Makassar",
  latitude: -5.1477,
  longitude: 119.4327,
  timezone: "Asia/Makassar",
};

const JAYAPURA: SholatLocation = {
  label: "Jayapura",
  latitude: -2.5337,
  longitude: 140.7181,
  timezone: "Asia/Jayapura",
};

function adhanReference(location: SholatLocation, year: number, month: number, day: number) {
  // adhan (batoulapps) is the industry reference; Kemenag uses Fajr 20°, Isha 18°.
  const params = new CalculationParameters("Other", 20, 18);
  return new PrayerTimes(
    new Coordinates(location.latitude, location.longitude),
    new Date(year, month - 1, day),
    params,
  );
}

type AdhanDateField = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
const ADHAN_KEY_MAP: Record<(typeof PRAYER_KEYS)[number], AdhanDateField> = {
  fajr: "fajr",
  sunrise: "sunrise",
  dhuhr: "dhuhr",
  asr: "asr",
  maghrib: "maghrib",
  isha: "isha",
};

const TOLERANCE_MS = 3 * 60 * 1000;
// Terbit (sunrise) intentionally differs: masaajid's Kemenag method applies
// the Indonesian ihtiyat convention, ending Subuh a few minutes early as a
// safety margin. Everything else matches adhan(20°/18°) within ~3 minutes.
const SUNRISE_TOLERANCE_MS = 5 * 60 * 1000;

describe("Kemenag prayer times vs adhan reference", () => {
  const fixtures: [string, SholatLocation, number, number, number][] = [
    ["Jakarta Aug 2026", JAKARTA, 2026, 8, 7],
    ["Jakarta Ramadan-equivalent Feb 2026", JAKARTA, 2026, 2, 20],
    ["Makassar Jun 2026", MAKASSAR, 2026, 6, 1],
    ["Jayapura Dec 2026", JAYAPURA, 2026, 12, 25],
  ];

  for (const [label, location, year, month, day] of fixtures) {
    test(`${label}: every prayer within 3 minutes of adhan(20/18)`, () => {
      const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const actual = getPrayerTimes(dayKey, location, "Kemenag");
      const expected = adhanReference(location, year, month, day);

      for (const key of PRAYER_KEYS) {
        const diffMs = Math.abs(actual[key].getTime() - expected[ADHAN_KEY_MAP[key]].getTime());
        const tolerance = key === "sunrise" ? SUNRISE_TOLERANCE_MS : TOLERANCE_MS;
        expect(
          diffMs,
          `${key}: masaajid=${actual[key].toISOString()} adhan=${expected[ADHAN_KEY_MAP[key]].toISOString()}`,
        ).toBeLessThanOrEqual(tolerance);
      }
    });
  }
});

describe("getPrayerTimes", () => {
  test("returns all six prayers in chronological order", () => {
    const times = getPrayerTimes("2026-08-07", JAKARTA, "Kemenag");
    for (let index = 1; index < PRAYER_KEYS.length; index += 1) {
      expect(times[PRAYER_KEYS[index]].getTime()).toBeGreaterThan(
        times[PRAYER_KEYS[index - 1]].getTime(),
      );
    }
  });

  test("known Jakarta fixture: Subuh around 04:44 WIB, Maghrib around 17:58 WIB", () => {
    const times = getPrayerTimes("2026-08-07", JAKARTA, "Kemenag");
    expect(formatTimeInZone(times.fajr, JAKARTA.timezone)).toBe("04.44");
    expect(formatTimeInZone(times.maghrib, JAKARTA.timezone)).toBe("17.58");
  });
});

describe("getMonthlyTimes", () => {
  test("covers every day of the month", () => {
    const rows = getMonthlyTimes(2026, 2, JAKARTA, "Kemenag");
    expect(rows).toHaveLength(28);
    expect(rows[0].dayKey).toBe("2026-02-01");
    expect(rows[27].dayKey).toBe("2026-02-28");
  });

  test("handles 31-day months", () => {
    expect(getMonthlyTimes(2026, 8, JAKARTA, "Kemenag")).toHaveLength(31);
  });
});

describe("getNextPrayer", () => {
  const times = getPrayerTimes("2026-08-07", JAKARTA, "Kemenag");

  test("before Subuh → Subuh", () => {
    const before = new Date(times.fajr.getTime() - 60_000);
    expect(getNextPrayer(times, before)?.key).toBe("fajr");
  });

  test("between prayers → the upcoming one", () => {
    const midday = new Date(times.dhuhr.getTime() + 60_000);
    expect(getNextPrayer(times, midday)?.key).toBe("asr");
  });

  test("after Isya → null (caller shows tomorrow's Subuh)", () => {
    const night = new Date(times.isha.getTime() + 60_000);
    expect(getNextPrayer(times, night)).toBeNull();
  });
});

describe("timezone helpers", () => {
  test("dateKeyInZone maps one UTC instant to different local dates", () => {
    // 2026-08-07T17:30:00Z is Aug 8 at 00:30 in Jayapura (UTC+9) but still
    // Aug 7 at 23:30 in London (UTC+1 in summer).
    const instant = new Date("2026-08-07T17:30:00Z");
    expect(dateKeyInZone(instant, "Asia/Jayapura")).toBe("2026-08-08");
    expect(dateKeyInZone(instant, "Europe/London")).toBe("2026-08-07");
  });

  test("formatTimeInZone renders HH.mm in the target zone regardless of device zone", () => {
    const instant = new Date("2026-08-07T10:58:00Z");
    expect(formatTimeInZone(instant, "Asia/Jakarta")).toBe("17.58");
    expect(formatTimeInZone(instant, "Asia/Jayapura")).toBe("19.58");
  });
});

describe("formatCountdown", () => {
  test("formats hours, minutes, and seconds", () => {
    expect(formatCountdown((1 * 3600 + 23 * 60 + 5) * 1000)).toBe("1 jam 23 mnt");
    expect(formatCountdown((45 * 60 + 10) * 1000)).toBe("45 mnt 10 dtk");
    expect(formatCountdown(59_000)).toBe("59 dtk");
    expect(formatCountdown(-5_000)).toBe("0 dtk");
  });
});
