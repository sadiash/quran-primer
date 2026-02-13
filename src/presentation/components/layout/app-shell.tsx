"use client";

import { type ReactNode } from "react";
import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { useWorkspace } from "@/presentation/providers";
import { TopBar } from "./top-bar";
import { ActivityBar } from "./activity-bar";
import { MobileNav } from "./mobile-nav";
import { StudyRegion } from "./study-region";
import { BottomPanel } from "@/presentation/components/panels/bottom-panel";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { state } = useWorkspace();
  const { studyRegionOpen } = state;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar className="hidden md:flex" />

        <Group orientation="horizontal" className="flex-1">
          <Panel
            id="reading-surface"
            minSize={30}
            defaultSize={studyRegionOpen ? 55 : 100}
          >
            <main id="main-content" className="h-full overflow-y-auto">
              {children}
            </main>
          </Panel>

          {studyRegionOpen && (
            <>
              <Separator className="w-1 bg-border/50 hover:bg-primary/20 transition-fast" />
              <Panel
                id="study-region"
                minSize={20}
                defaultSize={45}
              >
                <StudyRegion />
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* Audio dock — shows when audio is active */}
      <div className="shrink-0">
        <BottomPanel />
      </div>

      <MobileNav className="md:hidden" />
    </div>
  );
}
