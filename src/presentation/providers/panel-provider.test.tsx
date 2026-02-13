import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { PanelProvider, usePanelManager } from "./panel-provider";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <PanelProvider>{children}</PanelProvider>;
}

describe("PanelProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("throws when used outside provider", () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => usePanelManager());
    }).toThrow("usePanelManager must be used within a PanelProvider");
    spy.mockRestore();
  });

  it("provides default state", () => {
    const { result } = renderHook(() => usePanelManager(), { wrapper });

    expect(result.current.state.leftPanelOpen).toBe(false);
    expect(result.current.state.rightPanelOpen).toBe(false);
    expect(result.current.state.bottomPanelOpen).toBe(false);
    expect(result.current.state.activeRightTab).toBeNull();
    expect(result.current.state.activeBottomTab).toBeNull();
    expect(result.current.state.focusedVerseKey).toBeNull();
  });

  describe("focusVerse", () => {
    it("sets the focused verse key", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.focusVerse("1:1");
      });

      expect(result.current.state.focusedVerseKey).toBe("1:1");
    });

    it("clears the focused verse key", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.focusVerse("1:1");
      });
      act(() => {
        result.current.clearFocusedVerse();
      });

      expect(result.current.state.focusedVerseKey).toBeNull();
    });
  });

  describe("openPanel", () => {
    it("opens right panel with default tab", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("right");
      });

      expect(result.current.state.rightPanelOpen).toBe(true);
      expect(result.current.state.activeRightTab).toBe("tafsir");
    });

    it("opens right panel with specific tab", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("right", "hadith");
      });

      expect(result.current.state.rightPanelOpen).toBe(true);
      expect(result.current.state.activeRightTab).toBe("hadith");
    });

    it("opens bottom panel with default tab", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("bottom");
      });

      expect(result.current.state.bottomPanelOpen).toBe(true);
      expect(result.current.state.activeBottomTab).toBe("audio");
    });

    it("opens left panel", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("left");
      });

      // Left panel "open" maps to sidebar not collapsed
      expect(result.current.state.leftPanelOpen).toBe(false);
    });
  });

  describe("closePanel", () => {
    it("closes right panel", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("right");
      });
      act(() => {
        result.current.closePanel("right");
      });

      expect(result.current.state.rightPanelOpen).toBe(false);
    });

    it("closes bottom panel", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("bottom");
      });
      act(() => {
        result.current.closePanel("bottom");
      });

      expect(result.current.state.bottomPanelOpen).toBe(false);
    });
  });

  describe("togglePanel", () => {
    it("toggles right panel open and closed", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.togglePanel("right");
      });
      expect(result.current.state.rightPanelOpen).toBe(true);
      expect(result.current.state.activeRightTab).toBe("tafsir");

      act(() => {
        result.current.togglePanel("right");
      });
      expect(result.current.state.rightPanelOpen).toBe(false);
    });

    it("toggles with specific tab", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.togglePanel("right", "notes");
      });

      expect(result.current.state.rightPanelOpen).toBe(true);
      expect(result.current.state.activeRightTab).toBe("notes");
    });
  });

  describe("setActiveRightTab", () => {
    it("changes active right tab and opens panel", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.setActiveRightTab("crossref");
      });

      expect(result.current.state.activeRightTab).toBe("crossref");
      expect(result.current.state.rightPanelOpen).toBe(true);
    });
  });

  describe("setActiveBottomTab", () => {
    it("changes active bottom tab and opens panel", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.setActiveBottomTab("audio");
      });

      expect(result.current.state.activeBottomTab).toBe("audio");
      expect(result.current.state.bottomPanelOpen).toBe(true);
    });
  });

  describe("panel sizes", () => {
    it("provides default panel sizes", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      expect(result.current.panelSizes.rightPanelSize).toBe(30);
      expect(result.current.panelSizes.bottomPanelSize).toBe(30);
    });

    it("updates right panel size", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.setRightPanelSize(40);
      });

      expect(result.current.panelSizes.rightPanelSize).toBe(40);
    });

    it("updates bottom panel size", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.setBottomPanelSize(25);
      });

      expect(result.current.panelSizes.bottomPanelSize).toBe(25);
    });
  });

  describe("localStorage persistence", () => {
    it("persists workspace state to localStorage", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("right", "hadith");
      });

      const stored = JSON.parse(
        window.localStorage.getItem("workspace:state") ?? "{}",
      );
      expect(stored.studyRegionOpen).toBe(true);
      expect(Object.values(stored.panels ?? {}).length).toBeGreaterThan(0);
    });

    it("restores workspace state from localStorage", () => {
      // Pre-populate with workspace state
      window.localStorage.setItem(
        "workspace:state",
        JSON.stringify({
          panels: {
            "panel-1": {
              id: "panel-1",
              kind: "notes",
              config: {},
              breadcrumbs: [],
              scrollTop: 0,
              syncToVerse: true,
            },
          },
          studyGroups: [
            {
              id: "group-1",
              panelIds: ["panel-1"],
              activePanelId: "panel-1",
              sizePercent: 100,
            },
          ],
          studyRegionOpen: true,
          focusedPanelId: "panel-1",
          nextPanelId: 2,
          nextGroupId: 2,
        }),
      );

      const { result } = renderHook(() => usePanelManager(), { wrapper });

      expect(result.current.state.rightPanelOpen).toBe(true);
      expect(result.current.state.activeRightTab).toBe("notes");
    });

    it("persists panel sizes to localStorage", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.setBottomPanelSize(45);
      });

      const stored = JSON.parse(
        window.localStorage.getItem("workspace:state") ?? "{}",
      );
      expect(stored.bottomPanel?.sizePercent).toBe(45);
    });
  });

  describe("Escape key handling", () => {
    it("closes right panel on Escape", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("right");
      });

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(event);
      });

      expect(result.current.state.rightPanelOpen).toBe(false);
    });

    it("closes bottom panel on Escape when right is closed", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("bottom");
      });

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(event);
      });

      expect(result.current.state.bottomPanelOpen).toBe(false);
    });

    it("closes right panel first when both are open", () => {
      const { result } = renderHook(() => usePanelManager(), { wrapper });

      act(() => {
        result.current.openPanel("right");
        result.current.openPanel("bottom");
      });

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(event);
      });

      expect(result.current.state.rightPanelOpen).toBe(false);
      expect(result.current.state.bottomPanelOpen).toBe(true);
    });
  });
});
