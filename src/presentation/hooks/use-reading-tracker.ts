"use client";

import { useEffect, useRef, useCallback } from "react";
import { useProgress } from "./use-progress";

interface UseReadingTrackerOptions {
  surahId: number;
  totalVerses: number;
  getCurrentVerseKey: () => string | null;
}

export function useReadingTracker({
  surahId,
  totalVerses,
  getCurrentVerseKey,
}: UseReadingTrackerOptions) {
  const { progress, updateProgress } = useProgress(surahId);
  const maxVerseRef = useRef(0);

  // Seed from existing progress on mount
  useEffect(() => {
    if (progress?.lastVerseNumber) {
      maxVerseRef.current = Math.max(
        maxVerseRef.current,
        progress.lastVerseNumber,
      );
    }
  }, [progress]);

  const save = useCallback(() => {
    const currentKey = getCurrentVerseKey();
    if (!currentKey) return;

    const [, numStr] = currentKey.split(":");
    const currentNum = Number(numStr);
    if (!currentNum) return;

    maxVerseRef.current = Math.max(maxVerseRef.current, currentNum);

    updateProgress({
      surahId,
      lastVerseKey: currentKey,
      lastVerseNumber: currentNum,
      completedVerses: maxVerseRef.current,
      totalVerses,
      updatedAt: new Date(),
    });
  }, [surahId, totalVerses, getCurrentVerseKey, updateProgress]);

  // 3-second interval for auto-saving
  useEffect(() => {
    const interval = setInterval(save, 3000);
    return () => {
      clearInterval(interval);
      // Save on unmount
      save();
    };
  }, [save]);
}
