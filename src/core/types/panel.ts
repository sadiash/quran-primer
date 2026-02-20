/** Panel types — replaces the old drawer system with multi-panel docking */

export type PanelId = "tafsir" | "hadith" | "ai" | "notes" | "sources";
export type DockPosition = "left" | "right" | "bottom";

export interface PanelConfig {
  id: PanelId;
  dock: DockPosition;
  defaultSize: number; // percentage within the dock (0-100)
}

/** Static config — which panel lives where */
export const PANEL_REGISTRY: PanelConfig[] = [
  { id: "tafsir", dock: "left", defaultSize: 66 },
  { id: "hadith", dock: "left", defaultSize: 34 },
  { id: "notes", dock: "right", defaultSize: 50 },
  { id: "sources", dock: "right", defaultSize: 50 },
  { id: "ai", dock: "bottom", defaultSize: 100 },
];
