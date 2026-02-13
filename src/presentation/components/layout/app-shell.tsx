"use client";

import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, Group, Separator, type PanelSize } from "react-resizable-panels";
import { ActivityBar } from "./activity-bar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import { AudioDock } from "./audio-dock";
import { StudyRegion } from "./study-region";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import { CommandPalette } from "@/presentation/components/ui/command-palette";
import { useCommandPalette } from "@/presentation/hooks/use-command-palette";
import { useWorkspaceKeyboard } from "@/presentation/hooks/use-workspace-keyboard";
import { cn } from "@/lib/utils";
import type { Surah, ApiResponse } from "@/core/types";

// ---------------------------------------------------------------------------
// Resize handles
// ---------------------------------------------------------------------------

function HorizontalResizeHandle() {
  return (
    <Separator
      className={cn(
        "group relative flex items-center justify-center transition-fast",
        "h-px w-full cursor-row-resize hover:bg-primary/20",
      )}
    >
      <div className="h-1 w-8 rounded-full bg-border transition-fast group-hover:bg-primary/50 group-data-[resize-handle-active]:bg-primary" />
    </Separator>
  );
}

function VerticalResizeHandle() {
  return (
    <Separator
      className={cn(
        "group relative flex items-center justify-center transition-fast",
        "w-px cursor-col-resize hover:bg-primary/20",
      )}
    >
      <div className="h-8 w-1 rounded-full bg-border transition-fast group-hover:bg-primary/50 group-data-[resize-handle-active]:bg-primary" />
    </Separator>
  );
}

// ---------------------------------------------------------------------------
// AppShell
// ---------------------------------------------------------------------------

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isActive: audioActive } = useAudioPlayer();
  const ws = useWorkspace();
  useWorkspaceKeyboard();
  const { open, setOpen, toggle, recentCommandIds, addRecentCommand } =
    useCommandPalette();

  const { data: surahs = [] } = useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const res = await fetch("/api/v1/surahs");
      const json = (await res.json()) as ApiResponse<Surah[]>;
      if (!json.ok) throw new Error(json.error.message);
      return json.data;
    },
    staleTime: Infinity,
  });

  const showStudyRegion = ws.state.studyRegionOpen;
  const showBottomPanel = ws.state.bottomPanel.open;

  return (
    <div className="flex h-dvh overflow-hidden">
      <ActivityBar
        collapsed={ws.state.leftSidebar.collapsed}
        onToggle={() => ws.toggleSidebar()}
      />

      {/* Main layout: horizontal split (content | study region) */}
      <Group orientation="horizontal" id="main-layout" className="flex-1">
        {/* Content column */}
        <Panel id="content-panel" minSize={30}>
          <div className="flex h-full flex-col overflow-hidden">
            <TopBar
              onMenuToggle={() => ws.toggleSidebar()}
              onCommandPalette={toggle}
            />

            {/* Vertical split: reading surface | bottom panel */}
            <Group
              orientation="vertical"
              className="flex-1"
              id="panel-layout-vertical"
            >
              <Panel id="reading-panel" minSize={20}>
                <main
                  id="main-content"
                  className={cn(
                    "h-full overflow-y-auto pb-16 md:pb-0",
                    audioActive && !showBottomPanel && "pb-28 md:pb-14",
                  )}
                >
                  {children}
                </main>
              </Panel>

              {showBottomPanel && (
                <>
                  <HorizontalResizeHandle />
                  <Panel
                    id="bottom-panel"
                    defaultSize={ws.state.bottomPanel.sizePercent}
                    minSize={10}
                    maxSize={50}
                    onResize={(size: PanelSize) =>
                      ws.setBottomPanelSize(size.asPercentage)
                    }
                  >
                    <div className="h-full overflow-y-auto border-t border-border bg-background">
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Audio panel placeholder
                      </div>
                    </div>
                  </Panel>
                </>
              )}
            </Group>

            <div id="audio-dock-slot" />
          </div>
        </Panel>

        {/* Study region — multi-panel area */}
        {showStudyRegion && (
          <>
            <VerticalResizeHandle />
            <Panel
              id="study-region"
              defaultSize={40}
              minSize={20}
              maxSize={70}
            >
              <StudyRegion />
            </Panel>
          </>
        )}
      </Group>

      <MobileNav />
      <AudioDock />

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        surahs={surahs}
        recentCommandIds={recentCommandIds}
        onCommandExecuted={addRecentCommand}
      />
    </div>
  );
}
