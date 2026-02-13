"use client";

import { usePanelInstanceContext } from "@/presentation/providers/panel-instance-context";
import { useWorkspace } from "@/presentation/providers/workspace-provider";

/**
 * Returns the current verse key for a panel component.
 * When inside a PanelInstanceProvider, uses the panel's sync setting.
 * Falls back to the global focused verse key from the workspace.
 */
export function useVerseContext(): string | null {
  const panelInstance = usePanelInstanceContext();
  const ws = useWorkspace();

  if (panelInstance) {
    return panelInstance.syncToVerse
      ? ws.state.focusedVerseKey
      : (panelInstance.config.localVerseKey as string | undefined) ?? null;
  }

  return ws.state.focusedVerseKey;
}
