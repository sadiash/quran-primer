"use client";

import { useEffect, useCallback } from "react";

interface UseTheaterGesturesOptions {
  onNext: () => void;
  onPrev: () => void;
  onExit?: () => void;
}

/**
 * Keyboard and touch gestures for Theater Mode.
 * - Space / ArrowDown / j → next verse
 * - ArrowUp / k → previous verse
 * - Escape → exit theater mode
 */
export function useTheaterGestures({ onNext, onPrev, onExit }: UseTheaterGesturesOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "ArrowDown":
        case "j":
          e.preventDefault();
          onNext();
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          onPrev();
          break;
        case "Escape":
          e.preventDefault();
          onExit?.();
          break;
      }
    },
    [onNext, onPrev, onExit],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
