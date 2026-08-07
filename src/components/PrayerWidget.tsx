"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  PRAYER_LABELS,
  dateKeyInZone,
  formatCountdown,
  formatTimeInZone,
  getNextPrayer,
  getPrayerTimes,
} from "../lib/sholat";
import { useHasHydrated, useQuranStore } from "../lib/store";

/** Compact next-prayer countdown on the home page; deep-links to /sholat. */
export function PrayerWidget() {
  const hydrated = useHasHydrated();
  const location = useQuranStore((state) => state.location);
  const method = useQuranStore((state) => state.sholatMethod);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const next = useMemo(() => {
    if (!location) return null;
    const todayKey = dateKeyInZone(now, location.timezone);
    const found = getNextPrayer(getPrayerTimes(todayKey, location, method), now);
    if (found) return found;
    const tomorrow = getPrayerTimes(
      new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10),
      location,
      method,
    );
    return { key: "fajr" as const, at: tomorrow.fajr };
  }, [location, method, now]);

  if (!hydrated) return null;

  if (!location) {
    return (
      <Link
        href="/sholat/"
        className="motion-fade mb-4 flex items-center justify-between rounded-lg border border-border bg-base p-4 hover:border-primary"
      >
        <span className="text-sm font-semibold text-text">Jadwal Sholat</span>
        <span className="text-xs text-muted">Atur lokasi →</span>
      </Link>
    );
  }

  return (
    <Link
      href="/sholat/"
      aria-label={
        next
          ? `Buka jadwal sholat. ${PRAYER_LABELS[next.key]} ${formatTimeInZone(next.at, location.timezone)}`
          : "Buka jadwal sholat"
      }
      className="motion-fade mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-base p-4 hover:border-primary"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
          {next ? `Menuju ${PRAYER_LABELS[next.key]}` : "Jadwal Sholat"}
        </p>
        <p className="truncate text-xs text-muted">{location.label}</p>
      </div>
      {next ? (
        <div className="text-right">
          <p className="text-lg font-bold text-primary tabular-nums">
            {formatTimeInZone(next.at, location.timezone)}
          </p>
          <p className="text-xs text-muted tabular-nums" suppressHydrationWarning>
            {formatCountdown(next.at.getTime() - now.getTime())}
          </p>
        </div>
      ) : null}
    </Link>
  );
}
