"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

function getSnapshot(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const raw = useSyncExternalStore(subscribe, () => getSnapshot(key), getServerSnapshot);
  const [localState, setLocalState] = useState<T>(() => {
    if (raw !== null) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  });

  // Derive actual value: prefer raw from external store when available
  const value = raw !== null ? (() => {
    try { return JSON.parse(raw) as T; } catch { return localState; }
  })() : localState;

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setLocalState((prev) => {
        const nextValue = updater instanceof Function ? updater(prev) : updater;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // localStorage full or unavailable
        }
        return nextValue;
      });
    },
    [key],
  );

  return [value, setValue];
}
