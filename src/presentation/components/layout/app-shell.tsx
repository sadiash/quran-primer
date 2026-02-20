"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { PanelLayout } from "@/presentation/components/panels/panel-layout";
import { MobileStudySheet } from "@/presentation/components/drawer/mobile-study-sheet";
import { AudioDock } from "@/presentation/components/layout/audio-dock";
import { useAutoHideNav } from "@/presentation/hooks/use-auto-hide-nav";
import { usePreferences } from "@/presentation/hooks/use-preferences";

/** Routes where panels should never appear */
const NO_PANEL_ROUTES = ["/settings", "/onboarding", "/browse", "/bookmarks", "/notes", "/knowledge"];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navHidden = useAutoHideNav();
  const pathname = usePathname();
  const { preferences } = usePreferences();
  const zenMode = preferences.zenMode;
  const hidePanels = NO_PANEL_ROUTES.some((r) => pathname.startsWith(r));

  if (zenMode) {
    return (
      <div className="zen-mode flex h-dvh flex-col overflow-hidden">
        <main id="main-content" className="h-full flex-1 overflow-y-auto">
          {children}
        </main>
        <AudioDock />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopNav hidden={navHidden} />

      {/* Main area: multi-panel docking layout (desktop), skipped on non-reading routes */}
      <div className="flex flex-1 overflow-hidden">
        {hidePanels ? (
          <main id="main-content" className="h-full flex-1 overflow-y-auto">
            {children}
          </main>
        ) : (
          <PanelLayout>
            <main id="main-content" className="h-full flex-1 overflow-y-auto">
              {children}
            </main>
          </PanelLayout>
        )}
      </div>

      {/* Audio playback dock */}
      <AudioDock />

      {/* Mobile bottom sheet for study tools */}
      {!hidePanels && <MobileStudySheet />}

      <MobileNav className="md:hidden" />
    </div>
  );
}
