"use client";

import { useCallback } from "react";
import { usePanelInstanceContext } from "@/presentation/providers/panel-instance-context";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import type { BreadcrumbItem } from "@/core/types/workspace";

export function usePanelInstance() {
  const panel = usePanelInstanceContext();
  const workspace = useWorkspace();

  if (!panel) {
    throw new Error(
      "usePanelInstance must be used within a PanelInstanceProvider",
    );
  }

  // Resolve verse key: panel's local focused verse key (if any) or global
  const verseKey =
    panel.syncToVerse
      ? workspace.state.focusedVerseKey
      : (panel.config.localVerseKey as string | undefined) ?? null;

  const pushBreadcrumb = useCallback(
    (item: BreadcrumbItem) => {
      workspace.pushBreadcrumb(panel.id, item);
    },
    [workspace, panel.id],
  );

  const popBreadcrumb = useCallback(() => {
    workspace.popBreadcrumb(panel.id);
  }, [workspace, panel.id]);

  const gotoBreadcrumb = useCallback(
    (index: number) => {
      workspace.gotoBreadcrumb(panel.id, index);
    },
    [workspace, panel.id],
  );

  const setConfig = useCallback(
    (config: Record<string, unknown>) => {
      workspace.setPanelConfig(panel.id, config);
    },
    [workspace, panel.id],
  );

  const close = useCallback(() => {
    workspace.closePanel(panel.id);
  }, [workspace, panel.id]);

  return {
    panel,
    verseKey,
    pushBreadcrumb,
    popBreadcrumb,
    gotoBreadcrumb,
    setConfig,
    close,
    addPanel: workspace.addPanel,
  };
}
