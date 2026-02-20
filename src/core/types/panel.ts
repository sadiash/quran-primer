/** Panel types — replaces the old drawer system with multi-panel docking */

export type PanelId = "tafsir" | "hadith" | "ai" | "notes" | "sources";
export type DockPosition = "left" | "right" | "bottom";

export interface PanelConfig {
  id: PanelId;
  dock: DockPosition;
  defaultSize: number; // percentage within the dock (0-100)
  requiresVerse?: boolean; // hide panel when no verse is focused
}

/** Static config — which panel lives where */
export const PANEL_REGISTRY: PanelConfig[] = [
  { id: "tafsir", dock: "left", defaultSize: 66, requiresVerse: true },
  { id: "hadith", dock: "left", defaultSize: 34, requiresVerse: true },
  { id: "notes", dock: "right", defaultSize: 50 },
  { id: "sources", dock: "right", defaultSize: 50, requiresVerse: true },
  { id: "ai", dock: "bottom", defaultSize: 100 },
];
