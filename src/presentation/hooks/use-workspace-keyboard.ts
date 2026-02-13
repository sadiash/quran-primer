"use client";

import { useEffect } from "react";
import { useWorkspace } from "@/presentation/providers/workspace-provider";

/**
 * Global keyboard shortcuts for workspace management.
 *
 * - Cmd+B: Toggle study region
 * - Cmd+\: Split focused panel into new group
 * - Cmd+W: Close focused panel
 * - Cmd+Shift+[: Focus previous panel group
 * - Cmd+Shift+]: Focus next panel group
 */
export function useWorkspaceKeyboard() {
  const ws = useWorkspace();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      // Don't interfere with inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd+B: Toggle study region
      if (e.key === "b" && !e.shiftKey) {
        e.preventDefault();
        if (ws.state.studyRegionOpen) {
          ws.closeAllPanels();
        } else {
          ws.addPanel("tafsir");
        }
        return;
      }

      // Cmd+\: Split focused panel
      if (e.key === "\\" && !e.shiftKey) {
        e.preventDefault();
        if (ws.state.focusedPanelId) {
          ws.splitPanel(ws.state.focusedPanelId);
        }
        return;
      }

      // Cmd+W: Close focused panel
      if (e.key === "w" && !e.shiftKey) {
        e.preventDefault();
        if (ws.state.focusedPanelId) {
          ws.closePanel(ws.state.focusedPanelId);
        }
        return;
      }

      // Cmd+Shift+[ or ]: Focus prev/next group
      if (e.shiftKey && (e.key === "[" || e.key === "]")) {
        e.preventDefault();
        const groups = ws.state.studyGroups;
        if (groups.length < 2) return;

        const currentGroupIdx = groups.findIndex(
          (g) =>
            ws.state.focusedPanelId &&
            g.panelIds.includes(ws.state.focusedPanelId),
        );
        if (currentGroupIdx === -1) return;

        const direction = e.key === "[" ? -1 : 1;
        const nextIdx =
          (currentGroupIdx + direction + groups.length) % groups.length;
        const nextGroup = groups[nextIdx];
        if (nextGroup) {
          ws.focusPanel(nextGroup.activePanelId);
        }
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ws]);
}
