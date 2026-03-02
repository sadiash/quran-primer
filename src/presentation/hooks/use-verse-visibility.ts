"use client";

import { useRef, useEffect, useCallback, useState } from "react";

export function useVerseVisibility() {
  const currentVerseKeyRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [maxVerseRead, setMaxVerseRead] = useState(0);
  const maxVerseReadRef = useRef(0);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const verseKey = (entry.target as HTMLElement).dataset.verseKey;
            if (verseKey) {
              currentVerseKeyRef.current = verseKey;
              const num = Number(verseKey.split(":")[1]);
              if (num > maxVerseReadRef.current) {
                maxVerseReadRef.current = num;
                setMaxVerseRead(num);
              }
            }
          }
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const getCurrentVerseKey = useCallback(() => {
    return currentVerseKeyRef.current;
  }, []);

  const initMaxVerse = useCallback((n: number) => {
    if (n > maxVerseReadRef.current) {
      maxVerseReadRef.current = n;
      setMaxVerseRead(n);
    }
  }, []);

  return { observerRef, getCurrentVerseKey, maxVerseRead, initMaxVerse };
}
