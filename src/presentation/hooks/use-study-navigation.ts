"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BreadcrumbItemType =
  | "verse"
  | "tafsir"
  | "hadith"
  | "crossref"
  | "note";

export interface BreadcrumbItem {
  id: string;
  label: string;
  type: BreadcrumbItemType;
  verseKey?: string;
  resourceId?: number;
}

export interface StudyNavigation {
  /** The current breadcrumb trail */
  items: BreadcrumbItem[];
  /** Current depth (number of items in the stack) */
  depth: number;
  /** Push a new item onto the breadcrumb stack */
  push: (item: BreadcrumbItem) => void;
  /** Pop the top item off the stack */
  pop: () => void;
  /** Navigate to a specific index in the stack (removes everything after) */
  goTo: (index: number) => void;
  /** Clear the entire breadcrumb stack */
  clear: () => void;
  /** The current (top-most) item, or null if empty */
  current: BreadcrumbItem | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStudyNavigation(): StudyNavigation {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  const push = useCallback((item: BreadcrumbItem) => {
    setItems((prev) => {
      // Avoid duplicate consecutive pushes of the same id
      if (prev.length > 0 && prev[prev.length - 1]?.id === item.id) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const pop = useCallback(() => {
    setItems((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const goTo = useCallback((index: number) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      return prev.slice(0, index + 1);
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const current = items.length > 0 ? items[items.length - 1]! : null;

  return {
    items,
    depth: items.length,
    push,
    pop,
    goTo,
    clear,
    current,
  };
}
