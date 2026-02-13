"use client";

import { ChevronRight } from "lucide-react";
import { useWorkspace, PANEL_REGISTRY } from "@/presentation/providers";
import { cn } from "@/lib/utils";

interface PanelFrameProps {
  panelId: string;
  children: React.ReactNode;
}

export function PanelFrame({ panelId, children }: PanelFrameProps) {
  const { state, gotoBreadcrumb } = useWorkspace();
  const panel = state.panels[panelId];

  if (!panel) return null;

  const info = PANEL_REGISTRY[panel.kind];
  const hasBreadcrumbs = panel.breadcrumbs.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb bar — only shows when depth > 0 */}
      {hasBreadcrumbs && (
        <div className="flex items-center gap-1 border-b border-border/30 px-3 py-1.5 text-[10px]">
          <button
            onClick={() => gotoBreadcrumb(panelId, -1)}
            className="text-muted-foreground transition-fast hover:text-foreground"
          >
            {info.label}
          </button>
          {panel.breadcrumbs.map((crumb, i) => (
            <div key={crumb.id} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <button
                onClick={() => {
                  if (i < panel.breadcrumbs.length - 1) {
                    gotoBreadcrumb(panelId, i);
                  }
                }}
                className={cn(
                  "transition-fast",
                  i === panel.breadcrumbs.length - 1
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
}
