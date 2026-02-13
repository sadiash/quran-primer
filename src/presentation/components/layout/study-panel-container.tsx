"use client";

import { useCallback } from "react";
import { X, BookOpen, BookText, GitBranch, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/presentation/components/ui";
import {
  usePanelManager,
  type RightPanelTab,
} from "@/presentation/providers/panel-provider";
import { TafsirPanel } from "@/presentation/components/study/tafsir-panel";
import { HadithPanel } from "@/presentation/components/study/hadith-panel";
import { CrossReferencePanel } from "@/presentation/components/study/cross-reference-panel";
import { ContextPreview } from "@/presentation/components/study/context-preview";

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  id: RightPanelTab;
  label: string;
  icon: typeof BookOpen;
}

const tabs: TabDef[] = [
  { id: "tafsir", label: "Tafsir", icon: BookOpen },
  { id: "hadith", label: "Hadith", icon: BookText },
  { id: "crossref", label: "Cross-Ref", icon: GitBranch },
  { id: "notes", label: "Notes", icon: StickyNote },
];

// ---------------------------------------------------------------------------
// Notes placeholder (to be replaced by real notes panel later)
// ---------------------------------------------------------------------------

function NotesPlaceholder() {
  const { state } = usePanelManager();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
      <StickyNote className="h-10 w-10 opacity-40" />
      <div>
        <p className="text-sm font-medium">Notes Panel</p>
        {state.focusedVerseKey ? (
          <p className="mt-1 text-xs">
            Focused on verse {state.focusedVerseKey}
          </p>
        ) : (
          <p className="mt-1 text-xs">
            Select a verse to view notes
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content renderer
// ---------------------------------------------------------------------------

function TabContent({
  tab,
}: {
  tab: RightPanelTab;
}) {
  switch (tab) {
    case "tafsir":
      return <TafsirPanel />;
    case "hadith":
      return <HadithPanel />;
    case "crossref":
      return <CrossReferencePanel />;
    case "notes":
      return <NotesPlaceholder />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StudyPanelContainer() {
  const { state, setActiveRightTab, closePanel } = usePanelManager();

  const handleTabClick = useCallback(
    (tabId: RightPanelTab) => {
      setActiveRightTab(tabId);

      // Breadcrumb navigation removed — now handled per-panel
    },
    [setActiveRightTab],
  );

  // Show context preview when a verse is focused but no tab is active
  const showContextPreview =
    state.focusedVerseKey && !state.activeRightTab;

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border px-1">
        <div className="flex items-center overflow-x-auto" role="tablist" aria-label="Study panels">
          {tabs.map((tab) => {
            const isActive = state.activeRightTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-fast whitespace-nowrap",
                  isActive
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <IconButton
          label="Close study panel"
          variant="ghost"
          size="sm"
          onClick={() => closePanel("right")}
        >
          <X />
        </IconButton>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" role="tabpanel" id={`panel-${state.activeRightTab}`}>
        {showContextPreview ? (
          <ContextPreview />
        ) : state.activeRightTab ? (
          <TabContent tab={state.activeRightTab} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-40" />
            <p className="text-sm">Select a verse to begin studying</p>
          </div>
        )}
      </div>
    </div>
  );
}
