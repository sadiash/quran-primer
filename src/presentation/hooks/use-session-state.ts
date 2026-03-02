"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Like useState, but persists to sessionStorage so state survives
 * back/forward navigation within the same browser tab.
 */
export function useSessionState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setStateRaw] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // quota exceeded or unavailable — ignore
    }
  }, [key, state]);

  const setState = useCallback((value: T | ((prev: T) => T)) => {
    setStateRaw(value);
  }, []);

  return [state, setState];
}
