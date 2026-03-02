"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { usePanels } from "@/presentation/providers/panel-provider";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/presentation/components/ui/resizable";
import { DockGroup } from "./dock-group";

interface PanelLayoutProps {
  children: ReactNode;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

/**
 * Top-level multi-panel docking layout (desktop only, lg+).
 * Horizontal: [left dock] | [main content area] | [right dock]
 * The main content area is a vertical split: [reading surface] | [bottom dock]
 *
 * On mobile/tablet (<lg), panels render as a bottom sheet via
 * MobileStudySheet instead.
 *
 * NOTE: react-resizable-panels v4 treats bare numbers as pixels.
 * All size props must use percentage strings like "28%".
 */
export function PanelLayout({ children }: PanelLayoutProps) {
  const { hasLeftDock, hasRightDock, hasBottomDock } = usePanels();
  const isDesktop = useIsDesktop();

  const anyDockOpen = isDesktop && (hasLeftDock || hasRightDock || hasBottomDock);

  // Compute main content default size based on which docks are open
  const mainDefault = useMemo(() => {
    if (hasLeftDock && hasRightDock) return "44%";
    if (hasLeftDock || hasRightDock) return "72%";
    return "100%";
  }, [hasLeftDock, hasRightDock]);

  // No panels open — render children directly, no resizable overhead
  if (!anyDockOpen) {
    return <>{children}</>;
  }

  // Key forces remount when dock configuration changes, so defaultSize
  // values are re-applied (react-resizable-panels only uses defaultSize
  // on initial mount).
  const layoutKey = `${hasLeftDock ? "L" : ""}${hasRightDock ? "R" : ""}${hasBottomDock ? "B" : ""}`;

  return (
    <ResizablePanelGroup key={layoutKey} direction="horizontal" className="h-full">
      {/* Left dock */}
      {hasLeftDock && (
        <>
          <ResizablePanel
            id="left-dock"
            defaultSize="28%"
            minSize="18%"
            maxSize="45%"
          >
            <div className="h-full border-r border-border overflow-hidden">
              <DockGroup dock="left" />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle orientation="horizontal" />
        </>
      )}

      {/* Main content area (center + optional bottom dock) */}
      <ResizablePanel
        id="main-content"
        defaultSize={mainDefault}
        minSize="30%"
      >
        {hasBottomDock ? (
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel id="reading-area" defaultSize="70%" minSize="30%">
              {children}
            </ResizablePanel>
            <ResizableHandle withHandle orientation="vertical" />
            <ResizablePanel
              id="bottom-dock"
              defaultSize="30%"
              minSize="15%"
              maxSize="60%"
            >
              <div className="h-full border-t border-border overflow-hidden">
                <DockGroup dock="bottom" />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          children
        )}
      </ResizablePanel>

      {/* Right dock */}
      {hasRightDock && (
        <>
          <ResizableHandle withHandle orientation="horizontal" />
          <ResizablePanel
            id="right-dock"
            defaultSize="28%"
            minSize="18%"
            maxSize="45%"
          >
            <div className="h-full border-l border-border overflow-hidden">
              <DockGroup dock="right" />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
