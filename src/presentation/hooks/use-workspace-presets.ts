"use client";

import { useCallback } from "react";
import { BUILT_IN_PRESETS } from "@/core/types/preset";
import type { WorkspacePreset } from "@/core/types/preset";
import { usePreferences } from "./use-preferences";
import { usePanels } from "@/presentation/providers/panel-provider";

export function useWorkspacePresets() {
  const { updatePreferences } = usePreferences();
  const { closeAllPanels, openPanel } = usePanels();

  const applyPreset = useCallback(
    async (preset: WorkspacePreset) => {
      // Update preferences
      await updatePreferences(preset.preferences);

      // Reset panels: close all, then open preset panels
      closeAllPanels();
      for (const panelId of preset.panels) {
        openPanel(panelId);
      }
    },
    [updatePreferences, closeAllPanels, openPanel],
  );

  return { presets: BUILT_IN_PRESETS, applyPreset };
}
