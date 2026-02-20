"use client";

import { useState } from "react";
import {
  Type,
  LayoutGrid,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Settings2,
  Hash,
  Heading,
  Sparkles,
  AlignJustify,
} from "lucide-react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { cn } from "@/lib/utils";
import type { ArabicFontSize, TranslationLayout, ReadingDensity, ReadingFlow } from "@/core/types";

const ARABIC_SIZES: ArabicFontSize[] = ["sm", "md", "lg", "xl", "2xl"];
const LAYOUTS: { value: TranslationLayout; label: string }[] = [
  { value: "stacked", label: "Stacked" },
  { value: "columnar", label: "Side by side" },
];

const DENSITIES: { value: ReadingDensity; label: string }[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
  { value: "dense", label: "Dense" },
];

const FLOWS: { value: ReadingFlow; label: string }[] = [
  { value: "blocks", label: "Blocks" },
  { value: "prose", label: "Prose" },
];

export function ReadingToolbar() {
  const { preferences, updatePreferences } = usePreferences();
  const [open, setOpen] = useState(false);

  const arabicIdx = ARABIC_SIZES.indexOf(preferences.arabicFontSize);

  return (
    <div className="absolute bottom-6 right-6 z-10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full shadow-soft-md transition-all",
          "bg-card border border-border text-muted-foreground hover:text-foreground hover:shadow-soft-lg",
          open && "bg-primary text-primary-foreground",
        )}
        aria-label="Reading settings"
      >
        <Settings2 className="h-4 w-4" />
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-12 right-0 w-64 rounded-xl border border-border bg-card p-4 shadow-soft-lg animate-scale-in">
          <div className="space-y-4">
            {/* Arabic font size */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Type className="h-3.5 w-3.5" />
                Arabic Size
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (arabicIdx > 0) updatePreferences({ arabicFontSize: ARABIC_SIZES[arabicIdx - 1] });
                  }}
                  disabled={arabicIdx <= 0}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover disabled:opacity-30"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 text-center text-xs font-medium text-foreground uppercase">
                  {preferences.arabicFontSize}
                </span>
                <button
                  onClick={() => {
                    if (arabicIdx < ARABIC_SIZES.length - 1) updatePreferences({ arabicFontSize: ARABIC_SIZES[arabicIdx + 1] });
                  }}
                  disabled={arabicIdx >= ARABIC_SIZES.length - 1}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Layout toggle */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                Translation Layout
              </label>
              <div className="flex gap-1">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => updatePreferences({ translationLayout: l.value })}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs transition-fast",
                      preferences.translationLayout === l.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-surface-hover",
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading density */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                Density
              </label>
              <div className="flex gap-1">
                {DENSITIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => updatePreferences({ readingDensity: d.value })}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs transition-fast",
                      preferences.readingDensity === d.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-surface-hover",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading flow */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <AlignJustify className="h-3.5 w-3.5" />
                Reading Flow
              </label>
              <div className="flex gap-1">
                {FLOWS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => updatePreferences({ readingFlow: f.value })}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs transition-fast",
                      (preferences.readingFlow ?? "blocks") === f.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-surface-hover",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Arabic */}
            <button
              onClick={() => updatePreferences({ showArabic: !preferences.showArabic })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover transition-fast"
            >
              {preferences.showArabic ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {preferences.showArabic ? "Hide Arabic" : "Show Arabic"}
            </button>

            {/* Toggle Translation */}
            <button
              onClick={() => updatePreferences({ showTranslation: !preferences.showTranslation })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover transition-fast"
            >
              {preferences.showTranslation ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {preferences.showTranslation ? "Hide Translation" : "Show Translation"}
            </button>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Toggle Verse Numbers */}
            <button
              onClick={() => updatePreferences({ showVerseNumbers: !preferences.showVerseNumbers })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover transition-fast"
            >
              <Hash className="h-3.5 w-3.5" />
              {preferences.showVerseNumbers ? "Hide Verse Numbers" : "Show Verse Numbers"}
            </button>

            {/* Toggle Surah Headers */}
            <button
              onClick={() => updatePreferences({ showSurahHeaders: !preferences.showSurahHeaders })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover transition-fast"
            >
              <Heading className="h-3.5 w-3.5" />
              {preferences.showSurahHeaders ? "Hide Surah Header" : "Show Surah Header"}
            </button>

            {/* Toggle Bismillah */}
            <button
              onClick={() => updatePreferences({ showBismillah: !preferences.showBismillah })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover transition-fast"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {preferences.showBismillah ? "Hide Bismillah" : "Show Bismillah"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
