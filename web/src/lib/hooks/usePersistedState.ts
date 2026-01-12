"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "opncd:";

/**
 * A useState hook that persists the value to localStorage.
 * SSR-safe: returns initialValue during SSR and hydrates from localStorage on client.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  // Initialize with the initial value (SSR-safe)
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors, use initial value
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Persist to localStorage when value changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // Ignore storage errors (e.g., quota exceeded)
      }
    }
  }, [storageKey, value, isHydrated]);

  const setPersistedValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  return [value, setPersistedValue];
}
