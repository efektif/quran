"use client";

import { useEffect } from "react";

import { rehydrateStore, useQuranStore } from "../lib/store";

export function StoreHydrator() {
  useEffect(() => {
    void rehydrateStore();

    // Keep <html data-theme> in sync after hydration and on later changes.
    const applyTheme = (theme: "dark" | "light") => {
      document.documentElement.dataset.theme = theme;
    };
    applyTheme(useQuranStore.getState().theme);
    const unsubscribe = useQuranStore.subscribe((state) => applyTheme(state.theme));
    return unsubscribe;
  }, []);

  return null;
}
