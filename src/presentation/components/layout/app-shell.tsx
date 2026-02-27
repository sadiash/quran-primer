"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { PanelLayout } from "@/presentation/components/panels/panel-layout";
import { MobileStudySheet } from "@/presentation/components/drawer/mobile-study-sheet";
import { AudioDock } from "@/presentation/components/layout/audio-dock";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const audio = useAudioPlayer();
  const showPanels = pathname.startsWith("/surah");

  return (
    <div className={`flex h-dvh flex-col overflow-hidden ${audio.isActive ? "has-audio" : ""}`}>
      <TopNav />

      {/* Main area: multi-panel docking layout (desktop), skipped on non-reading routes */}
      <div className="flex flex-1 overflow-hidden reading-surface-offset">
        {showPanels ? (
          <PanelLayout>
            <main id="main-content" className="h-full flex-1 overflow-y-auto">
              {children}
            </main>
          </PanelLayout>
        ) : (
          <main id="main-content" className="h-full flex-1 overflow-y-auto">
            {children}
          </main>
        )}
      </div>

      {/* Audio playback dock */}
      <AudioDock />

      {/* Mobile bottom sheet for study tools */}
      {showPanels && <MobileStudySheet />}

      <MobileNav className="md:hidden" />
    </div>
  );
}
