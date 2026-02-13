"use client";

import { useCallback } from "react";
import {
  Eye,
  EyeOff,
  Rows3,
  Columns3,
  SquareStack,
} from "lucide-react";
import type { TranslationLayout } from "@/core/types";
import { cn } from "@/lib/utils";
import { IconButton, Tooltip } from "@/presentation/components/ui";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { TranslationSelector } from "./translation-selector";

const layoutOptions: {
  value: TranslationLayout;
  label: string;
  icon: typeof Rows3;
}[] = [
  { value: "stacked", label: "Stacked", icon: Rows3 },
  { value: "columnar", label: "Side by side", icon: Columns3 },
  { value: "tabbed", label: "Tabbed", icon: SquareStack },
];

export function ReadingToolbar() {
  const { preferences, updatePreferences } = usePreferences();

  const handleToggleArabic = useCallback(() => {
    updatePreferences({ showArabic: !preferences.showArabic });
  }, [preferences.showArabic, updatePreferences]);

  const handleLayoutChange = useCallback(
    (layout: TranslationLayout) => {
      updatePreferences({ translationLayout: layout });
    },
    [updatePreferences],
  );

  const handleTranslationToggle = useCallback(
    (id: number) => {
      const current = preferences.activeTranslationIds;
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];

      // Prevent removing all translations
      if (next.length === 0) return;

      updatePreferences({ activeTranslationIds: next });
    },
    [preferences.activeTranslationIds, updatePreferences],
  );

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-2 rounded-xl glass px-3 py-2 shadow-soft-sm"
      role="toolbar"
      aria-label="Reading toolbar"
    >
      {/* Arabic toggle */}
      <Tooltip content={preferences.showArabic ? "Hide Arabic" : "Show Arabic"}>
        <IconButton
          label={preferences.showArabic ? "Hide Arabic text" : "Show Arabic text"}
          variant={preferences.showArabic ? "default" : "ghost"}
          size="sm"
          onClick={handleToggleArabic}
          className={cn(
            preferences.showArabic && "bg-primary/10 text-primary",
          )}
        >
          {preferences.showArabic ? <Eye /> : <EyeOff />}
        </IconButton>
      </Tooltip>

      {/* Divider */}
      <div className="h-5 w-px bg-border/50" aria-hidden="true" />

      {/* Translation selector */}
      <TranslationSelector
        activeIds={preferences.activeTranslationIds}
        onToggle={handleTranslationToggle}
      />

      {/* Divider */}
      <div className="h-5 w-px bg-border/50" aria-hidden="true" />

      {/* Layout picker */}
      <div
        className="flex items-center gap-0.5"
        role="radiogroup"
        aria-label="Translation layout"
      >
        {layoutOptions.map(({ value, label, icon: Icon }) => (
          <Tooltip key={value} content={label}>
            <IconButton
              label={`${label} layout`}
              variant="ghost"
              size="sm"
              onClick={() => handleLayoutChange(value)}
              className={cn(
                preferences.translationLayout === value &&
                  "bg-primary/10 text-primary",
              )}
              aria-checked={preferences.translationLayout === value}
              role="radio"
            >
              <Icon />
            </IconButton>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
