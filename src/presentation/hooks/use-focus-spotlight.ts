"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type FocusLevel = "active" | "near" | "far";

/**
 * IntersectionObserver-based spotlight for Focus Flow mode.
 * Returns a Map<verseKey, FocusLevel> that classifies each verse
 * as active (center), near (adjacent), or far (everything else).
 */
export function useFocusSpotlight(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const visibleEntries = useRef(new Map<string, number>());

  // Recalculate which verse is most centered
  const recalculate = useCallback(() => {
    let bestKey: string | null = null;
    let bestRatio = 0;
    for (const [key, ratio] of visibleEntries.current) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestKey = key;
      }
    }
    setActiveKey(bestKey);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.verseKey;
          if (!key) continue;
          if (entry.isIntersecting) {
            visibleEntries.current.set(key, entry.intersectionRatio);
          } else {
            visibleEntries.current.delete(key);
          }
        }
        recalculate();
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    const verseEls = container.querySelectorAll("[data-verse-key]");
    verseEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef, recalculate]);

  /**
   * Get the focus class name for a given verse key based on its
   * proximity to the active (most centered) verse.
   */
  const getFocusClass = useCallback(
    (verseKey: string, allKeys: string[]): string => {
      if (!activeKey) return "focus-verse-far";
      if (verseKey === activeKey) return "focus-verse-active";

      const activeIdx = allKeys.indexOf(activeKey);
      const thisIdx = allKeys.indexOf(verseKey);
      const distance = Math.abs(thisIdx - activeIdx);

      if (distance <= 1) return "focus-verse-near";
      return "focus-verse-far";
    },
    [activeKey],
  );

  return { activeKey, getFocusClass };
}
