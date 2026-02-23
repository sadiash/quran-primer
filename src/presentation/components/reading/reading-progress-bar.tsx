"use client";

import { useState, useEffect, useCallback } from "react";

interface ReadingProgressBarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Thin accent-colored progress bar at the very top of the viewport.
 * Tracks scroll position of the reading surface container.
 */
export function ReadingProgressBar({ containerRef }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const max = scrollHeight - clientHeight;
    if (max <= 0) {
      setProgress(0);
      return;
    }
    setProgress(Math.min(100, (scrollTop / max) * 100));
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => el.removeEventListener("scroll", updateProgress);
  }, [containerRef, updateProgress]);

  if (progress <= 0) return null;

  return (
    <div
      className="reading-progress-bar"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
