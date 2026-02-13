"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  BookOpen,
  BookText,
  GitBranch,
  StickyNote,
  Brain,
  Eye,
  Bot,
  Languages,
} from "lucide-react";
import type {
  PanelKind,
  PanelInstance,
  PanelGroup,
  WorkspaceState,
  PanelTypeInfo,
  WorkspacePreset,
  WorkspacePresetId,
  BreadcrumbItem,
} from "@/core/types/workspace";

// ---------------------------------------------------------------------------
// Panel Type Registry
// ---------------------------------------------------------------------------

export const PANEL_REGISTRY: Record<PanelKind, PanelTypeInfo> = {
  tafsir: {
    kind: "tafsir",
    label: "Tafsir",
    icon: BookOpen,
    allowMultiple: false,
    minWidth: 15,
    verseAware: true,
    description: "Quranic commentary and exegesis",
  },
  hadith: {
    kind: "hadith",
    label: "Hadith",
    icon: BookText,
    allowMultiple: false,
    minWidth: 15,
    verseAware: true,
    description: "Related prophetic traditions",
  },
  notes: {
    kind: "notes",
    label: "Notes",
    icon: StickyNote,
    allowMultiple: false,
    minWidth: 15,
    verseAware: true,
    description: "Your personal study notes",
  },
  crossref: {
    kind: "crossref",
    label: "Cross-Ref",
    icon: GitBranch,
    allowMultiple: false,
    minWidth: 15,
    verseAware: true,
    description: "Cross-scripture references",
  },
  "knowledge-graph": {
    kind: "knowledge-graph",
    label: "Knowledge Graph",
    icon: Brain,
    allowMultiple: false,
    minWidth: 20,
    verseAware: false,
    description: "Visual knowledge connections",
  },
  "context-preview": {
    kind: "context-preview",
    label: "Context",
    icon: Eye,
    allowMultiple: false,
    minWidth: 15,
    verseAware: true,
    description: "Quick verse overview",
  },
  ai: {
    kind: "ai",
    label: "AI Assistant",
    icon: Bot,
    allowMultiple: false,
    minWidth: 20,
    verseAware: true,
    description: "AI-powered study assistant",
  },
  translation: {
    kind: "translation",
    label: "Translation",
    icon: Languages,
    allowMultiple: true,
    minWidth: 15,
    verseAware: true,
    description: "Side-by-side translation comparison",
  },
};

// ---------------------------------------------------------------------------
// Workspace Presets
// ---------------------------------------------------------------------------

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: "daily-reading",
    label: "Daily Reading",
    description: "Clean reading surface, no panels",
    panelKinds: [],
  },
  {
    id: "deep-study",
    label: "Deep Study",
    description: "Tafsir (2/3) + Hadith (1/3) stacked",
    panelKinds: [["tafsir", "hadith"]],
  },
  {
    id: "translation-comparison",
    label: "Translation Comparison",
    description: "No study panels, focus on translations",
    panelKinds: [],
  },
  {
    id: "research",
    label: "Research",
    description: "Tafsir + Cross-Ref + Notes stacked",
    panelKinds: [["tafsir", "crossref", "notes"]],
  },
  {
    id: "focus",
    label: "Focus",
    description: "All panels as tabs in one group",
    panelKinds: [["tafsir", "hadith", "crossref", "notes"]],
  },
];

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type WorkspaceAction =
  | { type: "ADD_PANEL"; kind: PanelKind; targetGroupId?: string; config?: Record<string, unknown> }
  | { type: "CLOSE_PANEL"; panelId: string }
  | { type: "FOCUS_PANEL"; panelId: string }
  | { type: "SET_PANEL_CONFIG"; panelId: string; config: Record<string, unknown> }
  | { type: "SET_PANEL_SCROLL"; panelId: string; scrollTop: number }
  | { type: "PUSH_BREADCRUMB"; panelId: string; item: BreadcrumbItem }
  | { type: "POP_BREADCRUMB"; panelId: string }
  | { type: "GOTO_BREADCRUMB"; panelId: string; index: number }
  | { type: "SET_ACTIVE_TAB"; groupId: string; panelId: string }
  | { type: "SPLIT_PANEL"; panelId: string }
  | { type: "RESIZE_GROUPS"; sizes: number[] }
  | { type: "FOCUS_VERSE"; verseKey: string }
  | { type: "CLEAR_FOCUSED_VERSE" }
  | { type: "TOGGLE_STUDY_REGION" }
  | { type: "TOGGLE_BOTTOM_PANEL" }
  | { type: "SET_BOTTOM_PANEL_SIZE"; size: number }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "APPLY_PRESET"; preset: WorkspacePresetId }
  | { type: "CLOSE_ALL_PANELS" }
  | { type: "HYDRATE"; state: Partial<WorkspaceState> };

// ---------------------------------------------------------------------------
// Initial State — defaults to "daily-reading" (clean surface, no panels)
// ---------------------------------------------------------------------------

const initialState: WorkspaceState = {
  panels: {},
  studyGroups: [],
  focusedPanelId: null,
  focusedVerseKey: null,
  studyRegionOpen: false,
  bottomPanel: { open: false, activeTab: null, sizePercent: 30 },
  leftSidebar: { open: false, collapsed: true },
  nextPanelId: 1,
  nextGroupId: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_GROUPS = 4;

function createPanel(
  id: string,
  kind: PanelKind,
  config: Record<string, unknown> = {},
): PanelInstance {
  return {
    id,
    kind,
    config,
    breadcrumbs: [],
    scrollTop: 0,
    syncToVerse: PANEL_REGISTRY[kind].verseAware,
  };
}

function equalGroupSizes(count: number): number[] {
  if (count === 0) return [];
  const size = Math.floor(100 / count);
  const sizes = Array(count).fill(size) as number[];
  sizes[0] = 100 - size * (count - 1);
  return sizes;
}

function applyPresetToState(
  state: WorkspaceState,
  presetId: WorkspacePresetId,
): WorkspaceState {
  const preset = WORKSPACE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return state;

  if (preset.panelKinds.length === 0) {
    return {
      ...state,
      panels: {},
      studyGroups: [],
      focusedPanelId: null,
      studyRegionOpen: false,
    };
  }

  let nextPanelId = state.nextPanelId;
  let nextGroupId = state.nextGroupId;
  const panels: Record<string, PanelInstance> = {};
  const studyGroups: PanelGroup[] = [];
  const sizes = equalGroupSizes(preset.panelKinds.length);

  for (let gi = 0; gi < preset.panelKinds.length; gi++) {
    const kinds = preset.panelKinds[gi]!;
    const groupId = `group-${nextGroupId++}`;
    const panelIds: string[] = [];

    for (const kind of kinds) {
      const panelId = `panel-${nextPanelId++}`;
      panels[panelId] = createPanel(panelId, kind);
      panelIds.push(panelId);
    }

    studyGroups.push({
      id: groupId,
      panelIds,
      activePanelId: panelIds[0]!,
      sizePercent: sizes[gi]!,
    });
  }

  return {
    ...state,
    panels,
    studyGroups,
    focusedPanelId: studyGroups[0]?.activePanelId ?? null,
    studyRegionOpen: true,
    nextPanelId,
    nextGroupId,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "ADD_PANEL": {
      const panelId = `panel-${state.nextPanelId}`;
      const panel = createPanel(panelId, action.kind, action.config);

      if (action.targetGroupId) {
        const groupIdx = state.studyGroups.findIndex(
          (g) => g.id === action.targetGroupId,
        );
        if (groupIdx >= 0) {
          const group = state.studyGroups[groupIdx]!;
          const updatedGroups = [...state.studyGroups];
          updatedGroups[groupIdx] = {
            ...group,
            panelIds: [...group.panelIds, panelId],
            activePanelId: panelId,
          };
          return {
            ...state,
            panels: { ...state.panels, [panelId]: panel },
            studyGroups: updatedGroups,
            focusedPanelId: panelId,
            studyRegionOpen: true,
            nextPanelId: state.nextPanelId + 1,
          };
        }
      }

      if (state.studyGroups.length >= MAX_GROUPS) {
        const focusedGroup =
          state.studyGroups.find(
            (g) =>
              state.focusedPanelId &&
              g.panelIds.includes(state.focusedPanelId),
          ) ?? state.studyGroups[0];

        if (focusedGroup) {
          const updatedGroups = state.studyGroups.map((g) =>
            g.id === focusedGroup.id
              ? {
                  ...g,
                  panelIds: [...g.panelIds, panelId],
                  activePanelId: panelId,
                }
              : g,
          );
          return {
            ...state,
            panels: { ...state.panels, [panelId]: panel },
            studyGroups: updatedGroups,
            focusedPanelId: panelId,
            studyRegionOpen: true,
            nextPanelId: state.nextPanelId + 1,
          };
        }
      }

      const groupId = `group-${state.nextGroupId}`;
      const newGroup: PanelGroup = {
        id: groupId,
        panelIds: [panelId],
        activePanelId: panelId,
        sizePercent: 0,
      };
      const updatedGroups = [...state.studyGroups, newGroup];
      const sizes = equalGroupSizes(updatedGroups.length);
      const resizedGroups = updatedGroups.map((g, i) => ({
        ...g,
        sizePercent: sizes[i]!,
      }));

      return {
        ...state,
        panels: { ...state.panels, [panelId]: panel },
        studyGroups: resizedGroups,
        focusedPanelId: panelId,
        studyRegionOpen: true,
        nextPanelId: state.nextPanelId + 1,
        nextGroupId: state.nextGroupId + 1,
      };
    }

    case "CLOSE_PANEL": {
      const { [action.panelId]: _, ...remainingPanels } = state.panels;
      void _; // consumed

      let updatedGroups = state.studyGroups
        .map((group) => {
          const idx = group.panelIds.indexOf(action.panelId);
          if (idx === -1) return group;
          const newPanelIds = group.panelIds.filter(
            (id) => id !== action.panelId,
          );
          return {
            ...group,
            panelIds: newPanelIds,
            activePanelId:
              group.activePanelId === action.panelId
                ? newPanelIds[Math.min(idx, newPanelIds.length - 1)] ?? ""
                : group.activePanelId,
          };
        })
        .filter((g) => g.panelIds.length > 0);

      const sizes = equalGroupSizes(updatedGroups.length);
      updatedGroups = updatedGroups.map((g, i) => ({
        ...g,
        sizePercent: sizes[i]!,
      }));

      const studyRegionOpen = updatedGroups.length > 0;
      const focusedPanelId =
        state.focusedPanelId === action.panelId
          ? updatedGroups[0]?.activePanelId ?? null
          : state.focusedPanelId;

      return {
        ...state,
        panels: remainingPanels,
        studyGroups: updatedGroups,
        focusedPanelId,
        studyRegionOpen,
      };
    }

    case "FOCUS_PANEL":
      if (!state.panels[action.panelId]) return state;
      return { ...state, focusedPanelId: action.panelId };

    case "SET_PANEL_CONFIG": {
      const panel = state.panels[action.panelId];
      if (!panel) return state;
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panelId]: {
            ...panel,
            config: { ...panel.config, ...action.config },
          },
        },
      };
    }

    case "SET_PANEL_SCROLL": {
      const panel = state.panels[action.panelId];
      if (!panel) return state;
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panelId]: { ...panel, scrollTop: action.scrollTop },
        },
      };
    }

    case "PUSH_BREADCRUMB": {
      const panel = state.panels[action.panelId];
      if (!panel) return state;
      const last = panel.breadcrumbs[panel.breadcrumbs.length - 1];
      if (last?.id === action.item.id) return state;
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panelId]: {
            ...panel,
            breadcrumbs: [...panel.breadcrumbs, action.item],
          },
        },
      };
    }

    case "POP_BREADCRUMB": {
      const panel = state.panels[action.panelId];
      if (!panel || panel.breadcrumbs.length === 0) return state;
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panelId]: {
            ...panel,
            breadcrumbs: panel.breadcrumbs.slice(0, -1),
          },
        },
      };
    }

    case "GOTO_BREADCRUMB": {
      const panel = state.panels[action.panelId];
      if (!panel) return state;
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panelId]: {
            ...panel,
            breadcrumbs: panel.breadcrumbs.slice(0, action.index + 1),
          },
        },
      };
    }

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        studyGroups: state.studyGroups.map((g) =>
          g.id === action.groupId
            ? { ...g, activePanelId: action.panelId }
            : g,
        ),
        focusedPanelId: action.panelId,
      };

    case "SPLIT_PANEL": {
      if (state.studyGroups.length >= MAX_GROUPS) return state;
      const sourceGroup = state.studyGroups.find((g) =>
        g.panelIds.includes(action.panelId),
      );
      if (!sourceGroup || sourceGroup.panelIds.length < 2) return state;

      const newPanelIds = sourceGroup.panelIds.filter(
        (id) => id !== action.panelId,
      );
      const newGroupId = `group-${state.nextGroupId}`;

      let updatedGroups = state.studyGroups.map((g) =>
        g.id === sourceGroup.id
          ? {
              ...g,
              panelIds: newPanelIds,
              activePanelId:
                g.activePanelId === action.panelId
                  ? newPanelIds[0]!
                  : g.activePanelId,
            }
          : g,
      );

      const sourceIdx = updatedGroups.findIndex(
        (g) => g.id === sourceGroup.id,
      );
      updatedGroups.splice(sourceIdx + 1, 0, {
        id: newGroupId,
        panelIds: [action.panelId],
        activePanelId: action.panelId,
        sizePercent: 0,
      });

      const sizes = equalGroupSizes(updatedGroups.length);
      updatedGroups = updatedGroups.map((g, i) => ({
        ...g,
        sizePercent: sizes[i]!,
      }));

      return {
        ...state,
        studyGroups: updatedGroups,
        focusedPanelId: action.panelId,
        nextGroupId: state.nextGroupId + 1,
      };
    }

    case "RESIZE_GROUPS":
      if (action.sizes.length !== state.studyGroups.length) return state;
      return {
        ...state,
        studyGroups: state.studyGroups.map((g, i) => ({
          ...g,
          sizePercent: action.sizes[i]!,
        })),
      };

    case "FOCUS_VERSE":
      return { ...state, focusedVerseKey: action.verseKey };

    case "CLEAR_FOCUSED_VERSE":
      return { ...state, focusedVerseKey: null };

    case "TOGGLE_STUDY_REGION":
      return { ...state, studyRegionOpen: !state.studyRegionOpen };

    case "TOGGLE_BOTTOM_PANEL":
      return {
        ...state,
        bottomPanel: {
          ...state.bottomPanel,
          open: !state.bottomPanel.open,
          activeTab: !state.bottomPanel.open
            ? state.bottomPanel.activeTab ?? "audio"
            : state.bottomPanel.activeTab,
        },
      };

    case "SET_BOTTOM_PANEL_SIZE":
      return {
        ...state,
        bottomPanel: { ...state.bottomPanel, sizePercent: action.size },
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        leftSidebar: {
          ...state.leftSidebar,
          collapsed: !state.leftSidebar.collapsed,
        },
      };

    case "APPLY_PRESET":
      return applyPresetToState(state, action.preset);

    case "CLOSE_ALL_PANELS":
      return {
        ...state,
        panels: {},
        studyGroups: [],
        focusedPanelId: null,
        studyRegionOpen: false,
      };

    case "HYDRATE":
      return { ...state, ...action.state };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const WORKSPACE_KEY = "workspace:state";

function loadWorkspaceState(): Partial<WorkspaceState> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(WORKSPACE_KEY);
    return stored ? (JSON.parse(stored) as Partial<WorkspaceState>) : null;
  } catch {
    return null;
  }
}

function saveWorkspaceState(state: WorkspaceState) {
  try {
    const toSave: Partial<WorkspaceState> = {
      panels: state.panels,
      studyGroups: state.studyGroups,
      studyRegionOpen: state.studyRegionOpen,
      focusedPanelId: state.focusedPanelId,
      nextPanelId: state.nextPanelId,
      nextGroupId: state.nextGroupId,
      bottomPanel: { ...state.bottomPanel },
    };
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage unavailable
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface WorkspaceContextValue {
  state: WorkspaceState;
  addPanel: (kind: PanelKind, targetGroupId?: string, config?: Record<string, unknown>) => void;
  closePanel: (panelId: string) => void;
  focusPanel: (panelId: string) => void;
  setPanelConfig: (panelId: string, config: Record<string, unknown>) => void;
  setPanelScroll: (panelId: string, scrollTop: number) => void;
  pushBreadcrumb: (panelId: string, item: BreadcrumbItem) => void;
  popBreadcrumb: (panelId: string) => void;
  gotoBreadcrumb: (panelId: string, index: number) => void;
  setActiveTab: (groupId: string, panelId: string) => void;
  splitPanel: (panelId: string) => void;
  resizeGroups: (sizes: number[]) => void;
  focusVerse: (verseKey: string) => void;
  clearFocusedVerse: () => void;
  toggleStudyRegion: () => void;
  toggleBottomPanel: () => void;
  setBottomPanelSize: (size: number) => void;
  toggleSidebar: () => void;
  applyPreset: (preset: WorkspacePresetId) => void;
  closeAllPanels: () => void;
  openPanelCount: number;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const saved = loadWorkspaceState();
    if (saved) {
      dispatch({ type: "HYDRATE", state: saved });
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (hydratedRef.current) {
      saveWorkspaceState(state);
    }
  }, [state]);

  const addPanel = useCallback(
    (kind: PanelKind, targetGroupId?: string, config?: Record<string, unknown>) => {
      dispatch({ type: "ADD_PANEL", kind, targetGroupId, config });
    },
    [],
  );
  const closePanel = useCallback((panelId: string) => dispatch({ type: "CLOSE_PANEL", panelId }), []);
  const focusPanel = useCallback((panelId: string) => dispatch({ type: "FOCUS_PANEL", panelId }), []);
  const setPanelConfig = useCallback((panelId: string, config: Record<string, unknown>) => dispatch({ type: "SET_PANEL_CONFIG", panelId, config }), []);
  const setPanelScroll = useCallback((panelId: string, scrollTop: number) => dispatch({ type: "SET_PANEL_SCROLL", panelId, scrollTop }), []);
  const pushBreadcrumb = useCallback((panelId: string, item: BreadcrumbItem) => dispatch({ type: "PUSH_BREADCRUMB", panelId, item }), []);
  const popBreadcrumb = useCallback((panelId: string) => dispatch({ type: "POP_BREADCRUMB", panelId }), []);
  const gotoBreadcrumb = useCallback((panelId: string, index: number) => dispatch({ type: "GOTO_BREADCRUMB", panelId, index }), []);
  const setActiveTab = useCallback((groupId: string, panelId: string) => dispatch({ type: "SET_ACTIVE_TAB", groupId, panelId }), []);
  const splitPanel = useCallback((panelId: string) => dispatch({ type: "SPLIT_PANEL", panelId }), []);
  const resizeGroups = useCallback((sizes: number[]) => dispatch({ type: "RESIZE_GROUPS", sizes }), []);
  const focusVerse = useCallback((verseKey: string) => dispatch({ type: "FOCUS_VERSE", verseKey }), []);
  const clearFocusedVerse = useCallback(() => dispatch({ type: "CLEAR_FOCUSED_VERSE" }), []);
  const toggleStudyRegion = useCallback(() => dispatch({ type: "TOGGLE_STUDY_REGION" }), []);
  const toggleBottomPanel = useCallback(() => dispatch({ type: "TOGGLE_BOTTOM_PANEL" }), []);
  const setBottomPanelSize = useCallback((size: number) => dispatch({ type: "SET_BOTTOM_PANEL_SIZE", size }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: "TOGGLE_SIDEBAR" }), []);
  const applyPreset = useCallback((preset: WorkspacePresetId) => dispatch({ type: "APPLY_PRESET", preset }), []);
  const closeAllPanels = useCallback(() => dispatch({ type: "CLOSE_ALL_PANELS" }), []);

  const openPanelCount = Object.keys(state.panels).length;

  const value: WorkspaceContextValue = {
    state,
    addPanel,
    closePanel,
    focusPanel,
    setPanelConfig,
    setPanelScroll,
    pushBreadcrumb,
    popBreadcrumb,
    gotoBreadcrumb,
    setActiveTab,
    splitPanel,
    resizeGroups,
    focusVerse,
    clearFocusedVerse,
    toggleStudyRegion,
    toggleBottomPanel,
    setBottomPanelSize,
    toggleSidebar,
    applyPreset,
    closeAllPanels,
    openPanelCount,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
