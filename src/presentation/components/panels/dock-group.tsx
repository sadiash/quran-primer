"use client";

import { BookOpen, BookText, Bot, ExternalLink, StickyNote } from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { PANEL_REGISTRY, type DockPosition, type PanelId } from "@/core/types/panel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/presentation/components/ui/resizable";
import { PanelShell } from "./panel-shell";
import { TafsirSection } from "@/presentation/components/drawer/tafsir-section";
import { HadithSection } from "@/presentation/components/drawer/hadith-section";
import { AiSection } from "@/presentation/components/drawer/ai-section";
import { SourcesSection } from "@/presentation/components/drawer/sources-section";
import { NotesSection } from "@/presentation/components/drawer/notes-section";

const PANEL_META: Record<PanelId, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  tafsir: { title: "Tafsir", icon: BookOpen },
  hadith: { title: "Hadith", icon: BookText },
  ai: { title: "AI", icon: Bot },
  notes: { title: "Notes", icon: StickyNote },
  sources: { title: "Sources", icon: ExternalLink },
};

const PANEL_CONTENT: Record<PanelId, React.ComponentType> = {
  tafsir: TafsirSection,
  hadith: HadithSection,
  ai: AiSection,
  notes: NotesSection,
  sources: SourcesSection,
};

interface DockGroupProps {
  dock: DockPosition;
}

export function DockGroup({ dock }: DockGroupProps) {
  const { openPanels } = usePanels();

  const visiblePanels = PANEL_REGISTRY.filter(
    (p) => p.dock === dock && openPanels.has(p.id),
  );

  if (visiblePanels.length === 0) return null;

  // Single panel — no resize handle needed
  if (visiblePanels.length === 1) {
    const panel = visiblePanels[0]!;
    const meta = PANEL_META[panel.id];
    const Content = PANEL_CONTENT[panel.id];
    return (
      <PanelShell id={panel.id} title={meta.title} icon={meta.icon}>
        <Content />
      </PanelShell>
    );
  }

  // Multiple panels — vertical split with resize handles
  return (
    <ResizablePanelGroup direction="vertical">
      {visiblePanels.map((panel) => {
        const meta = PANEL_META[panel.id];
        const Content = PANEL_CONTENT[panel.id];
        return (
          <ResizablePanel
            key={panel.id}
            id={panel.id}
            defaultSize={`${panel.defaultSize}%`}
            minSize="20%"
          >
            <PanelShell id={panel.id} title={meta.title} icon={meta.icon}>
              <Content />
            </PanelShell>
          </ResizablePanel>
        );
      }).reduce<React.ReactNode[]>((acc, el, i) => {
        if (i > 0) {
          acc.push(
            <ResizableHandle
              key={`handle-${i}`}
              withHandle
              orientation="vertical"
            />,
          );
        }
        acc.push(el);
        return acc;
      }, [])}
    </ResizablePanelGroup>
  );
}
