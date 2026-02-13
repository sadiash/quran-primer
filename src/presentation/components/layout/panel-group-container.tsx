"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import { PanelGroupHeader } from "./panel-group-header";
import { PanelBreadcrumb } from "./panel-breadcrumb";
import { PanelContent } from "./panel-content";
import type { PanelGroup } from "@/core/types/workspace";

interface PanelGroupContainerProps {
  group: PanelGroup;
}

export function PanelGroupContainer({ group }: PanelGroupContainerProps) {
  const ws = useWorkspace();
  const prefersReducedMotion = useReducedMotion();
  const activePanel = ws.state.panels[group.activePanelId];
  const isFocused =
    ws.state.focusedPanelId !== null &&
    group.panelIds.includes(ws.state.focusedPanelId);

  if (!activePanel) return null;

  return (
    <div
      className={cn(
        "flex h-full flex-col border-l border-border glass",
        isFocused && "ring-1 ring-primary/30 panel-focused",
      )}
      onClick={() => ws.focusPanel(group.activePanelId)}
    >
      <PanelGroupHeader group={group} />

      {activePanel.breadcrumbs.length > 0 && (
        <PanelBreadcrumb panel={activePanel} />
      )}

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel.id}
            className="h-full"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
          >
            <PanelContent panel={activePanel} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
