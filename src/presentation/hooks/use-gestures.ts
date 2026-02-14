"use client";

import { useRef, useCallback } from "react";

interface UseGesturesOptions {
  onLongPress?: () => void;
  onSwipeRight?: () => void;
}

/**
 * Pure PointerEvent-based gesture hook for touch-only interactions.
 * - Long-press: 500ms hold, cancel if pointer moves >10px
 * - Swipe-right: 80px horizontal threshold, cancel if vertical >30px,
 *   ignore if startX <30 (browser back gesture zone)
 */
export function useGestures({ onLongPress, onSwipeRight }: UseGesturesOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelled = useRef(false);

  const clear = useCallback(() => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = undefined;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") return;
      startX.current = e.clientX;
      startY.current = e.clientY;
      cancelled.current = false;

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (!cancelled.current) {
            onLongPress();
          }
        }, 500);
      }
    },
    [onLongPress],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Cancel long-press if moved >10px
      if (dist > 10) {
        cancelled.current = true;
        clear();
      }
    },
    [clear],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") return;
      clear();

      if (onSwipeRight && !cancelled.current) {
        const dx = e.clientX - startX.current;
        const dy = Math.abs(e.clientY - startY.current);

        // Swipe-right: 80px threshold, <30px vertical, not in browser back zone
        if (dx > 80 && dy < 30 && startX.current >= 30) {
          onSwipeRight();
        }
      }
    },
    [clear, onSwipeRight],
  );

  const onPointerCancel = useCallback(() => {
    cancelled.current = true;
    clear();
  }, [clear]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
