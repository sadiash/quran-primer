"use client";

import { type ReactNode } from "react";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { PanelLayout } from "@/presentation/components/panels/panel-layout";
import { MobileStudySheet } from "@/presentation/components/drawer/mobile-study-sheet";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopNav />

      {/* Main area: multi-panel docking layout (desktop) */}
      <div className="flex flex-1 overflow-hidden">
        <PanelLayout>
          <main id="main-content" className="h-full flex-1 overflow-y-auto">
            {children}
          </main>
        </PanelLayout>
      </div>

      {/* Mobile bottom sheet for study tools */}
      <MobileStudySheet />

      <MobileNav className="md:hidden" />
    </div>
  );
}
