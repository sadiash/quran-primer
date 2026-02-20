"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { PanelId, DockPosition } from "@/core/types/panel";
import { PANEL_REGISTRY } from "@/core/types/panel";

interface PanelContextValue {
  openPanels: Set<PanelId>;
  togglePanel: (id: PanelId) => void;
  openPanel: (id: PanelId) => void;
  closePanel: (id: PanelId) => void;
  closeAllPanels: () => void;

  hasLeftDock: boolean;
  hasRightDock: boolean;
  hasBottomDock: boolean;

  focusedVerseKey: string | null;
  focusVerse: (key: string) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

const STORAGE_KEY = "panels:open";

function panelsInDock(panels: Set<PanelId>, dock: DockPosition, focusedVerseKey: string | null): boolean {
  return PANEL_REGISTRY.some(
    (p) => p.dock === dock && panels.has(p.id) && (!p.requiresVerse || focusedVerseKey !== null),
  );
}

function loadOpenPanels(): Set<PanelId> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as PanelId[];
      return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveOpenPanels(panels: Set<PanelId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...panels]));
  } catch {
    // ignore
  }
}

export function PanelProvider({ children }: { children: ReactNode }) {
  // Start empty to match SSR, hydrate from localStorage in effect
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(new Set);
  const [focusedVerseKey, setFocusedVerseKey] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const stored = loadOpenPanels();
      if (stored.size > 0) setOpenPanels(stored);
    }
  }, []);

  const updatePanels = useCallback((next: Set<PanelId>) => {
    setOpenPanels(next);
    saveOpenPanels(next);
  }, []);

  const togglePanel = useCallback(
    (id: PanelId) => {
      setOpenPanels((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        saveOpenPanels(next);
        return next;
      });
    },
    [],
  );

  const openPanel = useCallback(
    (id: PanelId) => {
      setOpenPanels((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        saveOpenPanels(next);
        return next;
      });
    },
    [],
  );

  const closePanel = useCallback(
    (id: PanelId) => {
      setOpenPanels((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        saveOpenPanels(next);
        return next;
      });
    },
    [],
  );

  const closeAllPanels = useCallback(() => {
    updatePanels(new Set());
  }, [updatePanels]);

  const focusVerse = useCallback((key: string) => {
    setFocusedVerseKey(key);
  }, []);

  const hasLeftDock = useMemo(() => panelsInDock(openPanels, "left", focusedVerseKey), [openPanels, focusedVerseKey]);
  const hasRightDock = useMemo(() => panelsInDock(openPanels, "right", focusedVerseKey), [openPanels, focusedVerseKey]);
  const hasBottomDock = useMemo(() => panelsInDock(openPanels, "bottom", focusedVerseKey), [openPanels, focusedVerseKey]);

  const value = useMemo<PanelContextValue>(
    () => ({
      openPanels,
      togglePanel,
      openPanel,
      closePanel,
      closeAllPanels,
      hasLeftDock,
      hasRightDock,
      hasBottomDock,
      focusedVerseKey,
      focusVerse,
    }),
    [
      openPanels,
      togglePanel,
      openPanel,
      closePanel,
      closeAllPanels,
      hasLeftDock,
      hasRightDock,
      hasBottomDock,
      focusedVerseKey,
      focusVerse,
    ],
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

export function usePanels() {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanels must be used within a PanelProvider");
  }
  return ctx;
}
