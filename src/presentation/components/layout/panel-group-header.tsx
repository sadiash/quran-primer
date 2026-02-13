"use client";

import { X, Plus, Columns2, Link2, Link2Off } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, PANEL_REGISTRY } from "@/presentation/providers/workspace-provider";
import type { PanelGroup } from "@/core/types/workspace";

interface PanelGroupHeaderProps {
  group: PanelGroup;
}

export function PanelGroupHeader({ group }: PanelGroupHeaderProps) {
  const ws = useWorkspace();

  return (
    <div className="panel-header relative flex items-center justify-between border-b border-border px-1 min-h-[36px]">
      {/* Tabs */}
      <div
        className="flex items-center overflow-x-auto flex-1"
        role="tablist"
        aria-label="Panel tabs"
      >
        {group.panelIds.map((panelId) => {
          const panel = ws.state.panels[panelId];
          if (!panel) return null;
          const info = PANEL_REGISTRY[panel.kind];
          const isActive = group.activePanelId === panelId;
          const isFocused = ws.state.focusedPanelId === panelId;
          const Icon = info.icon;

          return (
            <button
              key={panelId}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseDown={(e) => {
                // Middle-click to close
                if (e.button === 1) {
                  e.preventDefault();
                  ws.closePanel(panelId);
                }
              }}
              onClick={() => {
                ws.setActiveTab(group.id, panelId);
                ws.focusPanel(panelId);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-fast whitespace-nowrap",
                isActive
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                isActive && isFocused && "panel-tab-active",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {info.label}
              {/* Close button on tab */}
              {group.panelIds.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    ws.closePanel(panelId);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      ws.closePanel(panelId);
                    }
                  }}
                  className="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted/80 transition-fast"
                  aria-label={`Close ${info.label}`}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 px-1">
        {/* Sync toggle */}
        {(() => {
          const activePanel = ws.state.panels[group.activePanelId];
          if (!activePanel) return null;
          return (
            <button
              type="button"
              onClick={() => {
                ws.setPanelConfig(group.activePanelId, {
                  syncToVerse: !activePanel.syncToVerse,
                });
              }}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-fast"
              title={activePanel.syncToVerse ? "Unlink from verse" : "Link to verse"}
            >
              {activePanel.syncToVerse ? (
                <Link2 className="h-3.5 w-3.5" />
              ) : (
                <Link2Off className="h-3.5 w-3.5" />
              )}
            </button>
          );
        })()}

        {/* Split button */}
        {group.panelIds.length >= 2 && (
          <button
            type="button"
            onClick={() => ws.splitPanel(group.activePanelId)}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-fast"
            title="Split panel into new group"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Add panel (to this group) */}
        <button
          type="button"
          onClick={() => ws.addPanel("tafsir", group.id)}
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-fast"
          title="Add panel to this group"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {/* Close group */}
        <button
          type="button"
          onClick={() => {
            // Close all panels in this group
            for (const panelId of group.panelIds) {
              ws.closePanel(panelId);
            }
          }}
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-fast"
          title="Close group"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
