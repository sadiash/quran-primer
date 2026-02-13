"use client";

import { type ReactNode, useMemo } from "react";
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

/**
 * Top-level multi-panel docking layout (desktop only).
 * Horizontal: [left dock] | [main content area] | [right dock]
 * The main content area is a vertical split: [reading surface] | [bottom dock]
 *
 * On mobile (<md), panels aren't toggled from TopNav so this renders
 * children directly. MobileStudySheet handles study tools on mobile.
 *
 * NOTE: react-resizable-panels v4 treats bare numbers as pixels.
 * All size props must use percentage strings like "28%".
 */
export function PanelLayout({ children }: PanelLayoutProps) {
  const { hasLeftDock, hasRightDock, hasBottomDock } = usePanels();

  const anyDockOpen = hasLeftDock || hasRightDock || hasBottomDock;

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
