import { PrayerTimeCalculator } from "@masaajid/prayer-times";
import type { MethodCode } from "@masaajid/prayer-times";

import type { SholatLocation } from "./store";

export const PRAYER_KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: "Subuh",
  sunrise: "Terbit",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export const SHOLAT_METHODS: { id: string; label: string }[] = [
  { id: "Kemenag", label: "Kemenag RI" },
  { id: "MWL", label: "Muslim World League" },
  { id: "ISNA", label: "ISNA (Amerika Utara)" },
  { id: "Egypt", label: "Mesir" },
  { id: "UmmAlQura", label: "Umm al-Qura (Makkah)" },
  { id: "Karachi", label: "Karachi" },
  { id: "Tehran", label: "Tehran" },
  { id: "Singapore", label: "MUIS Singapura" },
  { id: "JAKIM", label: "JAKIM Malaysia" },
  { id: "Turkey", label: "Diyanet Turki" },
];

export type DayPrayerTimes = Record<PrayerKey, Date>;

function makeCalculator(location: SholatLocation, method: string): PrayerTimeCalculator {
  return new PrayerTimeCalculator({
    method: method as MethodCode,
    location: [location.latitude, location.longitude],
    timezone: location.timezone,
  });
}

/** "YYYY-MM-DD" for an instant in the location's own timezone. */
export function dateKeyInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Times for one calendar day. The date string is interpreted in the
 * location's timezone; results are absolute Date instants (display them with
 * formatTimeInZone).
 */
export function getPrayerTimes(
  dayKey: string,
  location: SholatLocation,
  method: string,
): DayPrayerTimes {
  const result = makeCalculator(location, method).calculate(dayKey) as unknown as Record<
    string,
    Date
  >;
  return Object.fromEntries(PRAYER_KEYS.map((key) => [key, result[key]])) as DayPrayerTimes;
}

export function getMonthlyTimes(
  year: number,
  month: number,
  location: SholatLocation,
  method: string,
): { dayKey: string; times: DayPrayerTimes }[] {
  const calculator = makeCalculator(location, method);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const result = calculator.calculate(dayKey) as unknown as Record<string, Date>;
    return {
      dayKey,
      times: Object.fromEntries(PRAYER_KEYS.map((key) => [key, result[key]])) as DayPrayerTimes,
    };
  });
}

export interface NextPrayer {
  key: PrayerKey;
  at: Date;
}

/** First prayer whose time is still in the future; null if the day is done. */
export function getNextPrayer(times: DayPrayerTimes, now: Date): NextPrayer | null {
  for (const key of PRAYER_KEYS) {
    if (times[key].getTime() > now.getTime()) return { key, at: times[key] };
  }
  return null;
}

export function formatTimeInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** "1 jam 23 mnt" / "45 mnt" / "59 dtk" countdown text. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} jam ${minutes} mnt`;
  if (minutes > 0) return `${minutes} mnt ${seconds} dtk`;
  return `${seconds} dtk`;
}
