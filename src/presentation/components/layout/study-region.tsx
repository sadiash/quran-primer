"use client";

import { lazy, Suspense } from "react";
import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { X, Loader2 } from "lucide-react";
import { useWorkspace, PANEL_REGISTRY } from "@/presentation/providers";
import type { PanelKind } from "@/core/types";
import { cn } from "@/lib/utils";

// Lazy-load panel content components
const TafsirPanel = lazy(() => import("@/presentation/components/panels/tafsir-panel").then((m) => ({ default: m.TafsirPanel })));
const HadithPanel = lazy(() => import("@/presentation/components/panels/hadith-panel").then((m) => ({ default: m.HadithPanel })));
const NotesPanel = lazy(() => import("@/presentation/components/panels/notes-panel").then((m) => ({ default: m.NotesPanel })));
const TranslationPanel = lazy(() => import("@/presentation/components/panels/translation-panel").then((m) => ({ default: m.TranslationPanel })));
const CrossRefPanel = lazy(() => import("@/presentation/components/panels/crossref-panel").then((m) => ({ default: m.CrossRefPanel })));
const ContextPreviewPanel = lazy(() => import("@/presentation/components/panels/context-preview-panel").then((m) => ({ default: m.ContextPreviewPanel })));

function PanelLoadingFallback() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );
}

function getPanelComponent(kind: PanelKind) {
  switch (kind) {
    case "tafsir":
      return <TafsirPanel />;
    case "hadith":
      return <HadithPanel />;
    case "notes":
      return <NotesPanel />;
    case "translation":
      return <TranslationPanel />;
    case "crossref":
      return <CrossRefPanel />;
    case "context-preview":
      return <ContextPreviewPanel />;
    case "knowledge-graph":
    case "ai":
      return (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Coming soon
        </div>
      );
  }
}

// Default relative weights for panels in stacked mode
// Tafsir: 2/3 of right panel, Hadith: 1/3, Notes: compact
const STACKED_WEIGHTS: Record<PanelKind, number> = {
  tafsir: 4,
  hadith: 2,
  notes: 2,
  crossref: 2,
  translation: 3,
  "context-preview": 1,
  "knowledge-graph": 2,
  ai: 2,
};

function computeStackedSizes(kinds: PanelKind[]): number[] {
  const totalWeight = kinds.reduce((sum, k) => sum + (STACKED_WEIGHTS[k] ?? 1), 0);
  return kinds.map((k) => Math.round(((STACKED_WEIGHTS[k] ?? 1) / totalWeight) * 100));
}

export function StudyRegion() {
  const {
    state,
    closePanel,
    focusPanel,
  } = useWorkspace();

  const { studyGroups, panels, focusedPanelId } = state;

  if (studyGroups.length === 0) return null;

  return (
    <Group orientation="horizontal" className="h-full">
      {studyGroups.map((group, gi) => {
        const isStacked = group.panelIds.length > 1;

        return (
          <div key={group.id} className="contents">
            {gi > 0 && (
              <Separator className="w-1 bg-border/50 hover:bg-primary/20 transition-fast" />
            )}
            <Panel
              id={group.id}
              minSize={15}
              defaultSize={group.sizePercent}
            >
              {isStacked ? (
                <StackedPanels
                  groupId={group.id}
                  panelIds={group.panelIds}
                  panels={panels}
                  focusedPanelId={focusedPanelId}
                  onClose={closePanel}
                  onFocus={focusPanel}
                />
              ) : (
                <SinglePanel
                  panelId={group.panelIds[0]!}
                  panel={panels[group.panelIds[0]!]}
                  isFocused={focusedPanelId === group.panelIds[0]}
                  onClose={closePanel}
                  onFocus={focusPanel}
                />
              )}
            </Panel>
          </div>
        );
      })}
    </Group>
  );
}

/** Render multiple panels in a vertical stack with resizable splits */
function StackedPanels({
  groupId,
  panelIds,
  panels: panelMap,
  focusedPanelId,
  onClose,
  onFocus,
}: {
  groupId: string;
  panelIds: string[];
  panels: Record<string, import("@/core/types/workspace").PanelInstance>;
  focusedPanelId: string | null;
  onClose: (panelId: string) => void;
  onFocus: (panelId: string) => void;
}) {
  const panelKinds = panelIds
    .map((id) => panelMap[id]?.kind)
    .filter((k): k is PanelKind => k !== undefined);
  const sizes = computeStackedSizes(panelKinds);

  return (
    <Group orientation="vertical" className="h-full">
      {panelIds.map((panelId, pi) => {
        const panel = panelMap[panelId];
        if (!panel) return null;
        const info = PANEL_REGISTRY[panel.kind];
        const isFocused = focusedPanelId === panelId;
        const defaultSize = sizes[pi] ?? 33;

        return (
          <div key={panelId} className="contents">
            {pi > 0 && (
              <Separator className="h-1 bg-border/50 hover:bg-primary/20 transition-fast" />
            )}
            <Panel
              id={`${groupId}-${panelId}`}
              minSize={15}
              defaultSize={defaultSize}
            >
              <div className={cn(
                "flex h-full flex-col overflow-hidden",
                pi > 0 && "border-t border-border",
              )}>
                {/* Header */}
                <div className="flex h-8 shrink-0 items-center justify-between gap-1 border-b border-border bg-sidebar px-2">
                  <button
                    onClick={() => onFocus(panelId)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      isFocused ? "text-foreground font-medium" : "text-muted-foreground",
                    )}
                  >
                    <info.icon className="h-3.5 w-3.5" />
                    {info.label}
                  </button>
                  <button
                    onClick={() => onClose(panelId)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted transition-fast"
                    aria-label={`Close ${info.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3">
                  <Suspense fallback={<PanelLoadingFallback />}>
                    {getPanelComponent(panel.kind)}
                  </Suspense>
                </div>
              </div>
            </Panel>
          </div>
        );
      })}
    </Group>
  );
}

/** Render a single panel with a compact header */
function SinglePanel({
  panelId,
  panel,
  isFocused,
  onClose,
  onFocus,
}: {
  panelId: string;
  panel: import("@/core/types/workspace").PanelInstance | undefined;
  isFocused: boolean;
  onClose: (panelId: string) => void;
  onFocus: (panelId: string) => void;
}) {
  if (!panel) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No panel selected
      </div>
    );
  }

  const info = PANEL_REGISTRY[panel.kind];

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-border">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between gap-1 border-b border-border bg-sidebar px-2">
        <button
          onClick={() => onFocus(panelId)}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isFocused ? "text-foreground font-medium" : "text-muted-foreground",
          )}
        >
          <info.icon className="h-3.5 w-3.5" />
          {info.label}
        </button>
        <button
          onClick={() => onClose(panelId)}
          className="rounded p-0.5 text-muted-foreground hover:bg-muted transition-fast"
          aria-label={`Close ${info.label}`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Suspense fallback={<PanelLoadingFallback />}>
          {getPanelComponent(panel.kind)}
        </Suspense>
      </div>
    </div>
  );
}
