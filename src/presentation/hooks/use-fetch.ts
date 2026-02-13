"use client";

import { useState, useEffect } from "react";
import type { ApiResponse } from "@/core/types";

interface FetchResult<T> {
  data: T | null;
  error: string | null;
  fetchedKey: string;
}

/**
 * Hook that fetches data from an API endpoint, avoiding synchronous
 * setState inside useEffect (React Compiler lint rule).
 *
 * Loading state is derived: if the current `key` doesn't match `fetchedKey`,
 * a fetch is in progress.
 */
export function useFetch<T>(
  url: string | null,
  key: string,
): { data: T | null; error: string | null; isLoading: boolean } {
  const [result, setResult] = useState<FetchResult<T>>({
    data: null,
    error: null,
    fetchedKey: "",
  });

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    fetch(url)
      .then((res) => res.json())
      .then((json: ApiResponse<T>) => {
        if (cancelled) return;
        if (json.ok) {
          setResult({ data: json.data, error: null, fetchedKey: key });
        } else {
          setResult({ data: null, error: json.error.message, fetchedKey: key });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setResult({
            data: null,
            error: e instanceof Error ? e.message : "Failed to load",
            fetchedKey: key,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, key]);

  const isLoading = url !== null && result.fetchedKey !== key;
  const isCurrent = result.fetchedKey === key;

  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    isLoading,
  };
}
