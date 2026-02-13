"use client";

import type { ComponentType } from "react";
import { PanelInstanceProvider } from "@/presentation/providers/panel-instance-context";
import type { PanelInstance, PanelKind } from "@/core/types/workspace";
import { TafsirPanel } from "@/presentation/components/study/tafsir-panel";
import { HadithPanel } from "@/presentation/components/study/hadith-panel";
import { CrossReferencePanel } from "@/presentation/components/study/cross-reference-panel";
import { ContextPreview } from "@/presentation/components/study/context-preview";

// ---------------------------------------------------------------------------
// Placeholder components for panels not yet migrated
// ---------------------------------------------------------------------------

function NotesPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
      <p className="text-sm font-medium">Notes Panel</p>
      <p className="mt-1 text-xs">Select a verse to view notes</p>
    </div>
  );
}

function KnowledgeGraphPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
      <p className="text-sm font-medium">Knowledge Graph</p>
      <p className="mt-1 text-xs">Visual knowledge connections</p>
    </div>
  );
}

function AIPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
      <p className="text-sm font-medium">AI Assistant</p>
      <p className="mt-1 text-xs">Coming soon</p>
    </div>
  );
}

function TranslationPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
      <p className="text-sm font-medium">Translation Comparison</p>
      <p className="mt-1 text-xs">Coming soon</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const RENDERERS: Record<PanelKind, ComponentType> = {
  tafsir: TafsirPanel,
  hadith: HadithPanel,
  crossref: CrossReferencePanel,
  notes: NotesPlaceholder,
  "knowledge-graph": KnowledgeGraphPlaceholder,
  "context-preview": ContextPreview,
  ai: AIPlaceholder,
  translation: TranslationPlaceholder,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PanelContentProps {
  panel: PanelInstance;
}

export function PanelContent({ panel }: PanelContentProps) {
  const Renderer = RENDERERS[panel.kind];

  return (
    <PanelInstanceProvider panel={panel}>
      <div className="h-full overflow-y-auto">
        <Renderer />
      </div>
    </PanelInstanceProvider>
  );
}
