"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useHasHydrated, useQuranStore } from "../lib/store";
import {
  getAlKahfDayKey,
  shouldShowAlKahfReminder,
  AL_KAHF_SURAH_NUMBER,
} from "../utils/alKahfReminder";

export function AlKahfReminder() {
  const hydrated = useHasHydrated();
  const dismissedDay = useQuranStore((state) => state.alKahfDismissedDay);
  const dismissAlKahf = useQuranStore((state) => state.dismissAlKahf);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (hydrated) setVisible(shouldShowAlKahfReminder(dismissedDay));
  }, [hydrated, dismissedDay]);

  if (!visible) return null;

  const dismiss = () => {
    dismissAlKahf(getAlKahfDayKey());
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alkahf-title"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-base p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          Malam Jumat / Jumat
        </p>
        <h2 id="alkahf-title" className="mt-2 text-xl font-bold text-text">
          Baca Surah Al-Kahf
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Ada riwayat bahwa siapa yang membaca Surah Al-Kahf pada hari Jumat akan diberi cahaya di
          antara dua Jumat. Banyak yang memulainya sejak malam Jumat (Kamis malam).
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Buka Surah Al-Kahf"
            onClick={() => {
              dismiss();
              router.push(`/surah/${AL_KAHF_SURAH_NUMBER}/`);
            }}
            className="motion-fade h-11 rounded-md bg-primary text-sm font-bold text-on-primary hover:opacity-90"
          >
            Baca Al-Kahf
          </button>
          <button
            type="button"
            aria-label="Tutup pengingat"
            onClick={dismiss}
            className="motion-fade h-11 rounded-md border border-border text-sm font-semibold text-muted hover:text-text"
          >
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}
