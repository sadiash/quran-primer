"use client";

import { useMemo, useState } from "react";
import { BookOpenIcon, EyeIcon, EyeSlashIcon, MinusIcon, PlusIcon, SlidersHorizontalIcon, TextAaIcon } from "@phosphor-icons/react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { getResolvedTranslationConfigs } from "@/core/types";
import { cn } from "@/lib/utils";
import type { ArabicFontSize, TranslationFontSize } from "@/core/types";

const ARABIC_SIZES: ArabicFontSize[] = ["sm", "md", "lg", "xl", "2xl"];
const TRANSLATION_SIZES: TranslationFontSize[] = ["sm", "md", "lg", "xl"];

/** Translation name lookup */
const TRANSLATION_NAMES: Record<number, string> = {
  1001: "Clear Quran",
  1002: "Yusuf Ali",
  1003: "Pickthall",
  1004: "Al-Hilali & Khan",
  1005: "Abdel Haleem",
  1006: "Tafhim-ul-Quran",
};

interface ReadingToolbarProps {
  visibleTranslationIds?: number[];
  onToggleTranslation?: (id: number) => void;
}

export function ReadingToolbar({ visibleTranslationIds, onToggleTranslation }: ReadingToolbarProps) {
  const { preferences, updatePreferences } = usePreferences();
  const [open, setOpen] = useState(false);

  const arabicIdx = ARABIC_SIZES.indexOf(preferences.arabicFontSize);
  const translationIdx = TRANSLATION_SIZES.indexOf(preferences.translationFontSize);

  const resolvedConfigs = useMemo(
    () =>
      getResolvedTranslationConfigs(
        preferences.activeTranslationIds,
        preferences.translationConfigs,
        preferences.translationFontSize,
      ),
    [preferences.activeTranslationIds, preferences.translationConfigs, preferences.translationFontSize],
  );

  const updateTranslationSize = (size: TranslationFontSize) => {
    // Update global + all per-translation configs so the change takes effect everywhere
    const updatedConfigs = resolvedConfigs.map((c) => ({ ...c, fontSize: size }));
    updatePreferences({
      translationFontSize: size,
      translationConfigs: updatedConfigs,
    });
  };

  const showTranslationPills = resolvedConfigs.length > 1 && visibleTranslationIds && onToggleTranslation;

  return (
    <div className="absolute bottom-6 right-6 z-10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-9 items-center justify-center border border-border transition-colors shadow-sm",
          open
            ? "bg-foreground text-background"
            : "bg-background text-muted-foreground hover:text-foreground hover:border-foreground",
        )}
        aria-label="Reading settings"
      >
        <SlidersHorizontalIcon weight="bold" className="h-4 w-4" />
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 right-0 w-64 border border-border bg-background p-4 animate-scale-in shadow-sm">
            <div className="space-y-4">
              {/* Arabic font size */}
              <div>
                <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  <TextAaIcon weight="bold" className="h-3.5 w-3.5" />
                  [ ARABIC SIZE ]
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (arabicIdx > 0) updatePreferences({ arabicFontSize: ARABIC_SIZES[arabicIdx - 1] });
                    }}
                    disabled={arabicIdx <= 0}
                    className="p-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-30 transition-colors"
                  >
                    <MinusIcon weight="bold" className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex-1 text-center font-mono text-xs font-bold text-foreground uppercase">
                    {preferences.arabicFontSize}
                  </span>
                  <button
                    onClick={() => {
                      if (arabicIdx < ARABIC_SIZES.length - 1) updatePreferences({ arabicFontSize: ARABIC_SIZES[arabicIdx + 1] });
                    }}
                    disabled={arabicIdx >= ARABIC_SIZES.length - 1}
                    className="p-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-30 transition-colors"
                  >
                    <PlusIcon weight="bold" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Translation font size */}
              {preferences.showTranslation && (
                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    <BookOpenIcon weight="bold" className="h-3.5 w-3.5" />
                    [ TRANSLATION SIZE ]
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (translationIdx > 0) updateTranslationSize(TRANSLATION_SIZES[translationIdx - 1]!);
                      }}
                      disabled={translationIdx <= 0}
                      className="p-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-30 transition-colors"
                    >
                      <MinusIcon weight="bold" className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex-1 text-center font-mono text-xs font-bold text-foreground uppercase">
                      {preferences.translationFontSize}
                    </span>
                    <button
                      onClick={() => {
                        if (translationIdx < TRANSLATION_SIZES.length - 1) updateTranslationSize(TRANSLATION_SIZES[translationIdx + 1]!);
                      }}
                      disabled={translationIdx >= TRANSLATION_SIZES.length - 1}
                      className="p-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-30 transition-colors"
                    >
                      <PlusIcon weight="bold" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle Arabic */}
              <button
                onClick={() => updatePreferences({ showArabic: !preferences.showArabic })}
                className="flex w-full items-center gap-2 px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface transition-colors"
              >
                {preferences.showArabic ? (
                  <EyeIcon weight="bold" className="h-3.5 w-3.5" />
                ) : (
                  <EyeSlashIcon weight="bold" className="h-3.5 w-3.5" />
                )}
                {preferences.showArabic ? "HIDE ARABIC" : "SHOW ARABIC"}
              </button>

              {/* Toggle Translation */}
              <button
                onClick={() => updatePreferences({ showTranslation: !preferences.showTranslation })}
                className="flex w-full items-center gap-2 px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface transition-colors"
              >
                {preferences.showTranslation ? (
                  <EyeIcon weight="bold" className="h-3.5 w-3.5" />
                ) : (
                  <EyeSlashIcon weight="bold" className="h-3.5 w-3.5" />
                )}
                {preferences.showTranslation ? "HIDE TRANSLATION" : "SHOW TRANSLATION"}
              </button>

              {/* Translation toggle pills */}
              {showTranslationPills && preferences.showTranslation && (
                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    <BookOpenIcon weight="bold" className="h-3.5 w-3.5" />
                    [ TRANSLATIONS ]
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {resolvedConfigs.map((c) => {
                      const isVisible = visibleTranslationIds!.includes(c.translationId);
                      return (
                        <button
                          key={c.translationId}
                          onClick={() => onToggleTranslation!(c.translationId)}
                          className={cn(
                            "font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 border transition-colors",
                            isVisible
                              ? "border-border text-foreground bg-[#fefce8]"
                              : "border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {TRANSLATION_NAMES[c.translationId] ?? `#${c.translationId}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
