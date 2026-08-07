"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { searchCities, type City } from "../data/cities";
import {
  PRAYER_KEYS,
  PRAYER_LABELS,
  SHOLAT_METHODS,
  dateKeyInZone,
  formatCountdown,
  formatTimeInZone,
  getMonthlyTimes,
  getNextPrayer,
  getPrayerTimes,
  type NextPrayer,
} from "../lib/sholat";
import { useHasHydrated, useQuranStore, type SholatLocation } from "../lib/store";

function shiftDayKey(dayKey: string, offsetDays: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + offsetDays));
  return shifted.toISOString().slice(0, 10);
}

export function SholatClient() {
  const hydrated = useHasHydrated();
  const location = useQuranStore((state) => state.location);
  const method = useQuranStore((state) => state.sholatMethod);
  const setSholatMethod = useQuranStore((state) => state.setSholatMethod);

  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState<"harian" | "bulanan">("harian");
  const [dayOffset, setDayOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = useMemo(
    () => (location ? dateKeyInZone(now, location.timezone) : dateKeyInZone(now, "UTC")),
    [now, location],
  );
  const viewDayKey = shiftDayKey(todayKey, dayOffset);
  const [viewYear, viewMonth] = viewDayKey.split("-").map(Number);

  const monthParts = useMemo(() => {
    const base = new Date(Date.UTC(viewYear, viewMonth - 1 + monthOffset, 1));
    return { year: base.getUTCFullYear(), month: base.getUTCMonth() + 1 };
  }, [viewYear, viewMonth, monthOffset]);

  const dayTimes = useMemo(
    () => (location ? getPrayerTimes(viewDayKey, location, method) : null),
    [viewDayKey, location, method],
  );

  const monthTimes = useMemo(
    () => (location ? getMonthlyTimes(monthParts.year, monthParts.month, location, method) : []),
    [monthParts, location, method],
  );

  const nextPrayer: NextPrayer | null = useMemo(() => {
    if (!location) return null;
    const todayTimes = getPrayerTimes(todayKey, location, method);
    const next = getNextPrayer(todayTimes, now);
    if (next) return next;
    const tomorrow = getPrayerTimes(shiftDayKey(todayKey, 1), location, method);
    return { key: "fajr", at: tomorrow.fajr };
  }, [location, todayKey, method, now]);

  if (!hydrated) {
    return (
      <div className="py-10 text-center text-sm text-muted" role="status">
        Memuat…
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-text">Jadwal Sholat</h1>
      <p className="mt-1 text-sm text-muted">
        Dihitung di perangkat (metode {method}) — dapat berbeda beberapa menit dari jadwal resmi
        setempat.
      </p>

      <LocationPicker />

      {!location ? null : (
        <>
          <section
            aria-label="Waktu sholat berikutnya"
            className="mt-4 rounded-lg border border-primary/40 bg-primary-soft p-4"
          >
            {nextPrayer ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-wide text-primary uppercase">
                    Menuju {PRAYER_LABELS[nextPrayer.key]}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-text" suppressHydrationWarning>
                    {formatCountdown(nextPrayer.at.getTime() - now.getTime())}
                  </p>
                </div>
                <p className="text-xl font-bold text-primary">
                  {formatTimeInZone(nextPrayer.at, location.timezone)}
                </p>
              </div>
            ) : null}
          </section>

          <div className="mt-4 flex items-center gap-2">
            <div
              className="flex flex-1 items-center gap-1 rounded-lg border border-border bg-base p-1"
              role="tablist"
              aria-label="Tampilan jadwal"
            >
              {(["harian", "bulanan"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={view === value}
                  onClick={() => setView(value)}
                  className={`motion-fade flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
                    view === value ? "bg-primary text-on-primary" : "text-muted hover:text-text"
                  }`}
                >
                  {value === "harian" ? "Harian" : "Bulanan"}
                </button>
              ))}
            </div>

            <label className="sr-only" htmlFor="method-select">
              Metode perhitungan
            </label>
            <select
              id="method-select"
              value={method}
              onChange={(event) => setSholatMethod(event.target.value)}
              className="h-10 rounded-lg border border-border bg-base px-2 text-sm text-text"
            >
              {SHOLAT_METHODS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {view === "harian" && dayTimes ? (
            <section aria-label="Jadwal harian" className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDayOffset((value) => value - 1)}
                  aria-label="Hari sebelumnya"
                  className="motion-fade rounded-md border border-border bg-base px-3 py-2 text-sm text-text hover:border-primary"
                >
                  ‹
                </button>
                <div className="text-center">
                  <p className="text-sm font-bold text-text">
                    {formatDateLong(`${viewDayKey}T12:00:00Z`, location.timezone)}
                  </p>
                  <p className="text-xs text-muted">
                    {formatHijri(`${viewDayKey}T12:00:00Z`, location.timezone)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDayOffset((value) => value + 1)}
                  aria-label="Hari berikutnya"
                  className="motion-fade rounded-md border border-border bg-base px-3 py-2 text-sm text-text hover:border-primary"
                >
                  ›
                </button>
              </div>

              {dayOffset !== 0 ? (
                <button
                  type="button"
                  onClick={() => setDayOffset(0)}
                  className="mb-3 w-full rounded-md border border-border py-1.5 text-xs font-semibold text-primary"
                >
                  Kembali ke hari ini
                </button>
              ) : null}

              <ul className="flex flex-col gap-2">
                {PRAYER_KEYS.map((key) => {
                  const isNext =
                    dayOffset === 0 && nextPrayer?.key === key && nextPrayer.at === dayTimes[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        isNext ? "border-primary bg-primary-soft" : "border-border bg-base"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${isNext ? "text-primary" : "text-text"}`}
                      >
                        {PRAYER_LABELS[key]}
                      </span>
                      <span
                        className={`text-lg font-bold tabular-nums ${isNext ? "text-primary" : "text-text"}`}
                      >
                        {formatTimeInZone(dayTimes[key], location.timezone)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {view === "bulanan" ? (
            <section aria-label="Jadwal bulanan" className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMonthOffset((value) => value - 1)}
                  aria-label="Bulan sebelumnya"
                  className="motion-fade rounded-md border border-border bg-base px-3 py-2 text-sm text-text hover:border-primary"
                >
                  ‹
                </button>
                <p className="text-sm font-bold text-text">
                  {new Intl.DateTimeFormat("id-ID", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(Date.UTC(monthParts.year, monthParts.month - 1, 1)))}
                </p>
                <button
                  type="button"
                  onClick={() => setMonthOffset((value) => value + 1)}
                  aria-label="Bulan berikutnya"
                  className="motion-fade rounded-md border border-border bg-base px-3 py-2 text-sm text-text hover:border-primary"
                >
                  ›
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-left text-xs text-muted">
                      <th className="px-3 py-2 font-semibold">Tgl</th>
                      {PRAYER_KEYS.map((key) => (
                        <th key={key} className="px-3 py-2 text-right font-semibold">
                          {PRAYER_LABELS[key]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthTimes.map((row) => (
                      <tr
                        key={row.dayKey}
                        className={`border-b border-border last:border-0 ${
                          row.dayKey === todayKey ? "bg-primary-soft" : "bg-base"
                        }`}
                      >
                        <td className="px-3 py-2 font-semibold text-text">
                          {Number(row.dayKey.slice(8))}
                        </td>
                        {PRAYER_KEYS.map((key) => (
                          <td key={key} className="px-3 py-2 text-right tabular-nums text-text">
                            {formatTimeInZone(row.times[key], location.timezone)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function formatDateLong(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

function formatHijri(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function LocationPicker() {
  const location = useQuranStore((state) => state.location);
  const setLocation = useQuranStore((state) => state.setLocation);
  const [open, setOpen] = useState(!location);
  const [query, setQuery] = useState("");
  const [geoState, setGeoState] = useState<"idle" | "working" | "error">("idle");

  const results = searchCities(query);

  const pick = useCallback(
    (city: City) => {
      setLocation({
        label: `${city.name}, ${city.province}`,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
      });
      setOpen(false);
      setQuery("");
    },
    [setLocation],
  );

  const useGeolocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoState("error");
      return;
    }
    setGeoState("working");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const next: SholatLocation = {
          label: "Lokasi saya",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone,
        };
        setLocation(next);
        setGeoState("idle");
        setOpen(false);
      },
      () => setGeoState("error"),
      { timeout: 10_000 },
    );
  };

  return (
    <section aria-label="Lokasi" className="mt-4 rounded-lg border border-border bg-base p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Lokasi</p>
          <p className="truncate text-sm font-semibold text-text">
            {location ? location.label : "Belum diatur"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="motion-fade rounded-md border border-border px-3 py-2 text-xs font-semibold text-text hover:border-primary"
        >
          {open ? "Tutup" : "Ganti lokasi"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={useGeolocation}
            disabled={geoState === "working"}
            className="motion-fade mb-3 w-full rounded-md bg-primary px-3 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {geoState === "working" ? "Mendeteksi lokasi…" : "Gunakan lokasi saya"}
          </button>
          {geoState === "error" ? (
            <p className="mb-3 text-xs text-red-400">
              Lokasi tidak tersedia. Pilih kota secara manual di bawah.
            </p>
          ) : null}

          <label className="sr-only" htmlFor="city-search">
            Cari kota
          </label>
          <input
            id="city-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari kota atau provinsi…"
            className="h-10 w-full rounded-md border border-border bg-canvas px-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
          />

          <ul className="mt-2 flex max-h-56 flex-col overflow-y-auto">
            {results.map((city) => (
              <li key={`${city.name}-${city.province}`}>
                <button
                  type="button"
                  onClick={() => pick(city)}
                  className="motion-fade flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-surface"
                >
                  <span className="text-sm font-medium text-text">{city.name}</span>
                  <span className="text-xs text-muted">
                    {city.province} · {city.timezone.split("/")[1].replace("_", " ")}
                  </span>
                </button>
              </li>
            ))}
            {query.trim().length >= 2 && results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">Kota tidak ditemukan.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
