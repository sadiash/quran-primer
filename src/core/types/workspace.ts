/** Workspace layout types — multi-panel study platform */

import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Panel Kinds
// ---------------------------------------------------------------------------

export type PanelKind =
  | "tafsir"
  | "hadith"
  | "notes"
  | "crossref"
  | "knowledge-graph"
  | "context-preview"
  | "ai"
  | "translation";

// ---------------------------------------------------------------------------
// Breadcrumb
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

// ---------------------------------------------------------------------------
// Panel Instance
// ---------------------------------------------------------------------------

export interface PanelInstance {
  id: string;
  kind: PanelKind;
  config: Record<string, unknown>;
  breadcrumbs: BreadcrumbItem[];
  scrollTop: number;
  syncToVerse: boolean;
}

// ---------------------------------------------------------------------------
// Panel Group
// ---------------------------------------------------------------------------

export interface PanelGroup {
  id: string;
  panelIds: string[];
  activePanelId: string;
  sizePercent: number;
}

// ---------------------------------------------------------------------------
// Workspace State
// ---------------------------------------------------------------------------

export interface WorkspaceState {
  panels: Record<string, PanelInstance>;
  studyGroups: PanelGroup[];
  focusedPanelId: string | null;
  focusedVerseKey: string | null;
  studyRegionOpen: boolean;
  bottomPanel: { open: boolean; activeTab: string | null; sizePercent: number };
  leftSidebar: { open: boolean; collapsed: boolean };
  nextPanelId: number;
  nextGroupId: number;
}

// ---------------------------------------------------------------------------
// Panel Type Registry
// ---------------------------------------------------------------------------

export interface PanelTypeInfo {
  kind: PanelKind;
  label: string;
  icon: LucideIcon;
  allowMultiple: boolean;
  minWidth: number;
  verseAware: boolean;
  description: string;
}

// ---------------------------------------------------------------------------
// Workspace Presets
// ---------------------------------------------------------------------------

export type WorkspacePresetId =
  | "daily-reading"
  | "deep-study"
  | "translation-comparison"
  | "research"
  | "focus";

export interface WorkspacePreset {
  id: WorkspacePresetId;
  label: string;
  description: string;
  panelKinds: PanelKind[][];
}
