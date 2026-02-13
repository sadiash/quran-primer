"use client";

/**
 * Backward-compatibility shim — maps the old PanelProvider / usePanelManager
 * API onto the new WorkspaceProvider / useWorkspace() API.
 *
 * Existing consumers (tests, components) continue to work unchanged.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  WorkspaceProvider,
  useWorkspace,
} from "./workspace-provider";
import type { PanelKind } from "@/core/types/workspace";

// ---------------------------------------------------------------------------
// Legacy Types (kept for backward compat)
// ---------------------------------------------------------------------------

export type PanelPosition = "left" | "right" | "bottom";
export type RightPanelTab = "tafsir" | "hadith" | "crossref" | "notes";
export type BottomPanelTab = "audio";
export type PanelTab = RightPanelTab | BottomPanelTab;

export interface PanelState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  activeRightTab: RightPanelTab | null;
  activeBottomTab: BottomPanelTab | null;
  focusedVerseKey: string | null;
}

interface PanelSizes {
  rightPanelSize: number;
  bottomPanelSize: number;
}

// ---------------------------------------------------------------------------
// Context value type (legacy API surface)
// ---------------------------------------------------------------------------

interface PanelContextValue {
  state: PanelState;
  panelSizes: PanelSizes;
  focusVerse: (verseKey: string) => void;
  clearFocusedVerse: () => void;
  openPanel: (position: PanelPosition, tab?: PanelTab) => void;
  closePanel: (position: PanelPosition) => void;
  togglePanel: (position: PanelPosition, tab?: PanelTab) => void;
  setActiveRightTab: (tab: RightPanelTab) => void;
  setActiveBottomTab: (tab: BottomPanelTab) => void;
  setRightPanelSize: (size: number) => void;
  setBottomPanelSize: (size: number) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

// ---------------------------------------------------------------------------
// Map from legacy right tab to PanelKind
// ---------------------------------------------------------------------------

const TAB_TO_KIND: Record<RightPanelTab, PanelKind> = {
  tafsir: "tafsir",
  hadith: "hadith",
  crossref: "crossref",
  notes: "notes",
};

// ---------------------------------------------------------------------------
// Inner shim (reads from WorkspaceProvider)
// ---------------------------------------------------------------------------

function PanelProviderShim({ children }: { children: ReactNode }) {
  const ws = useWorkspace();
  const [rightPanelSize, setRightPanelSizeLocal] = useState(30);

  // Derive legacy PanelState from workspace state
  const activePanel = ws.state.focusedPanelId
    ? ws.state.panels[ws.state.focusedPanelId]
    : null;

  // Find the "active right tab" — the kind of whichever panel is currently
  // active (if it's one of the legacy tabs)
  const activeRightTab: RightPanelTab | null = activePanel
    ? ((
        ["tafsir", "hadith", "crossref", "notes"] as RightPanelTab[]
      ).find((t) => t === activePanel.kind) ?? null)
    : null;

  const studyRegionOpen = ws.state.studyRegionOpen;
  const bottomPanelOpen = ws.state.bottomPanel.open;

  const state: PanelState = {
    leftPanelOpen: ws.state.leftSidebar.open,
    rightPanelOpen: studyRegionOpen,
    bottomPanelOpen,
    activeRightTab,
    activeBottomTab: bottomPanelOpen
      ? (ws.state.bottomPanel.activeTab as BottomPanelTab)
      : null,
    focusedVerseKey: ws.state.focusedVerseKey,
  };

  const panelSizes: PanelSizes = {
    rightPanelSize,
    bottomPanelSize: ws.state.bottomPanel.sizePercent,
  };

  // Escape key closes topmost panel (backward compat)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[role='dialog']")) return;

      if (studyRegionOpen) {
        ws.closeAllPanels();
        e.preventDefault();
      } else if (bottomPanelOpen) {
        ws.toggleBottomPanel();
        e.preventDefault();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [studyRegionOpen, bottomPanelOpen, ws]);

  const focusVerse = ws.focusVerse;
  const clearFocusedVerse = ws.clearFocusedVerse;

  const openPanel = useCallback(
    (position: PanelPosition, tab?: PanelTab) => {
      if (position === "right") {
        const kind = tab
          ? TAB_TO_KIND[tab as RightPanelTab] ?? "tafsir"
          : "tafsir";
        if (!ws.state.studyRegionOpen) {
          ws.addPanel(kind);
        } else if (tab) {
          const existing = Object.values(ws.state.panels).find(
            (p) => p.kind === kind,
          );
          if (existing) {
            ws.focusPanel(existing.id);
            const group = ws.state.studyGroups.find((g) =>
              g.panelIds.includes(existing.id),
            );
            if (group) {
              ws.setActiveTab(group.id, existing.id);
            }
          } else {
            ws.addPanel(kind);
          }
        }
      } else if (position === "bottom") {
        if (!ws.state.bottomPanel.open) {
          ws.toggleBottomPanel();
        }
      } else if (position === "left") {
        if (ws.state.leftSidebar.collapsed) {
          ws.toggleSidebar();
        }
      }
    },
    [ws],
  );

  const closePanel = useCallback(
    (position: PanelPosition) => {
      if (position === "right") {
        ws.closeAllPanels();
      } else if (position === "bottom") {
        if (ws.state.bottomPanel.open) {
          ws.toggleBottomPanel();
        }
      } else if (position === "left") {
        if (!ws.state.leftSidebar.collapsed) {
          ws.toggleSidebar();
        }
      }
    },
    [ws],
  );

  const togglePanel = useCallback(
    (position: PanelPosition, tab?: PanelTab) => {
      if (position === "right") {
        if (ws.state.studyRegionOpen) {
          ws.closeAllPanels();
        } else {
          const kind = tab
            ? TAB_TO_KIND[tab as RightPanelTab] ?? "tafsir"
            : "tafsir";
          ws.addPanel(kind);
        }
      } else if (position === "bottom") {
        ws.toggleBottomPanel();
      } else if (position === "left") {
        ws.toggleSidebar();
      }
    },
    [ws],
  );

  const setActiveRightTab = useCallback(
    (tab: RightPanelTab) => {
      const kind = TAB_TO_KIND[tab];
      const existing = Object.values(ws.state.panels).find(
        (p) => p.kind === kind,
      );
      if (existing) {
        ws.focusPanel(existing.id);
        const group = ws.state.studyGroups.find((g) =>
          g.panelIds.includes(existing.id),
        );
        if (group) {
          ws.setActiveTab(group.id, existing.id);
        }
      } else {
        ws.addPanel(kind);
      }
    },
    [ws],
  );

  const setActiveBottomTab = useCallback(
    (_tab: BottomPanelTab) => {
      if (!ws.state.bottomPanel.open) {
        ws.toggleBottomPanel();
      }
    },
    [ws],
  );

  const setRightPanelSize = useCallback((size: number) => {
    setRightPanelSizeLocal(size);
  }, []);

  const setBottomPanelSize = ws.setBottomPanelSize;

  const value: PanelContextValue = {
    state,
    panelSizes,
    focusVerse,
    clearFocusedVerse,
    openPanel,
    closePanel,
    togglePanel,
    setActiveRightTab,
    setActiveBottomTab,
    setRightPanelSize,
    setBottomPanelSize,
  };

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Exported Provider — wraps WorkspaceProvider + shim
// ---------------------------------------------------------------------------

export function PanelProvider({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <PanelProviderShim>{children}</PanelProviderShim>
    </WorkspaceProvider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePanelManager() {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanelManager must be used within a PanelProvider");
  }
  return ctx;
}
