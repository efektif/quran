import { useCallback, useEffect, useState } from "react";

import {
  getAlKahfDayKey,
  shouldShowAlKahfReminder,
} from "../utils/alKahfReminder";
import { preloadStorage, storage } from "../utils/storage";

const STORAGE_KEY = "alKahfReminderDismissedDay";

function readDismissedDay(): string | null {
  return storage.getString(STORAGE_KEY);
}

export function useAlKahfReminder() {
  const [visible, setVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    preloadStorage(STORAGE_KEY).then(() => {
      if (cancelled) return;
      setVisible(shouldShowAlKahfReminder(readDismissedDay()));
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    storage.set(STORAGE_KEY, getAlKahfDayKey());
    setVisible(false);
  }, []);

  return {
    visible,
    isLoaded,
    dismiss,
  };
}
