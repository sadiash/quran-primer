"use client";

import { useRef, useEffect, useCallback } from "react";

export function useVerseVisibility() {
  const currentVerseKeyRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const verseKey = (entry.target as HTMLElement).dataset.verseKey;
            if (verseKey) {
              currentVerseKeyRef.current = verseKey;
            }
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const getCurrentVerseKey = useCallback(() => {
    return currentVerseKeyRef.current;
  }, []);

  return { observerRef, getCurrentVerseKey };
}
