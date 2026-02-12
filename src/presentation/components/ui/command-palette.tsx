"use client";

import { useCallback, useMemo } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, BookOpen, Hash, Sun, Moon, Sparkles } from "lucide-react";
import { useToast } from "@/presentation/components/ui/toast";
import type { Surah } from "@/core/types";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahs: Surah[];
  recentCommandIds?: string[];
  onCommandExecuted?: (commandId: string) => void;
}

const VERSE_PATTERN = /^(\d{1,3}):(\d{1,3})$/;

export function CommandPalette({
  open,
  onOpenChange,
  surahs,
  recentCommandIds = [],
  onCommandExecuted,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const prefersReducedMotion = useReducedMotion();
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const execute = useCallback(
    (id: string, action: () => void) => {
      action();
      onCommandExecuted?.(id);
      close();
    },
    [onCommandExecuted, close],
  );

  const handleSurahSelect = useCallback(
    (surah: Surah) => {
      execute(`surah-${surah.id}`, () => {
        router.push(`/surahs/${surah.id}`);
      });
    },
    [execute, router],
  );

  const handleVerseInput = useCallback(
    (input: string) => {
      const match = VERSE_PATTERN.exec(input.trim());
      if (!match?.[1] || !match[2]) return;
      const surahId = parseInt(match[1], 10);
      const verseNum = parseInt(match[2], 10);
      if (surahId < 1 || surahId > 114) return;
      execute(`verse-${surahId}:${verseNum}`, () => {
        router.push(`/surahs/${surahId}#verse-${verseNum}`);
      });
    },
    [execute, router],
  );

  const handleThemeToggle = useCallback(() => {
    execute("toggle-theme", () => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  }, [execute, theme, setTheme]);

  const handleScriptToggle = useCallback(() => {
    execute("toggle-script", () => {
      toast("Arabic script toggle coming soon");
    });
  }, [execute, toast]);

  // Build recent commands lookup
  const recentSurahs = useMemo(() => {
    if (recentCommandIds.length === 0) return [];
    return recentCommandIds
      .filter((id) => id.startsWith("surah-"))
      .map((id) => {
        const surahId = parseInt(id.replace("surah-", ""), 10);
        return surahs.find((s) => s.id === surahId);
      })
      .filter((s): s is Surah => s !== undefined);
  }, [recentCommandIds, surahs]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-80" role="presentation">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            onClick={close}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
          >
            <CommandPrimitive
              label="Command palette"
              className="glass w-full max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-xl shadow-glow overflow-hidden"
              loop
            >
              {/* Input */}
              <div className="flex items-center gap-2 border-b border-border px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <CommandPrimitive.Input
                  placeholder="Search surahs, jump to verse (2:255), or run a command..."
                  className="flex h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  onValueChange={(value) => {
                    if (VERSE_PATTERN.test(value.trim())) {
                      // Handled on select, but we keep search active
                    }
                  }}
                />
              </div>

              {/* List */}
              <CommandPrimitive.List className="max-h-80 overflow-y-auto p-2">
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </CommandPrimitive.Empty>

                {/* Recent commands */}
                {recentSurahs.length > 0 && (
                  <CommandPrimitive.Group heading="Recent">
                    {recentSurahs.map((surah) => (
                      <CommandPrimitive.Item
                        key={`recent-${surah.id}`}
                        value={`recent ${surah.id} ${surah.nameSimple} ${surah.nameArabic}`}
                        onSelect={() => handleSurahSelect(surah)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground aria-selected:bg-surface-hover"
                      >
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{surah.nameSimple}</span>
                        <span className="text-xs text-muted-foreground" dir="rtl">
                          {surah.nameArabic}
                        </span>
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                )}

                {/* Go to Verse */}
                <CommandPrimitive.Group heading="Quick Jump">
                  <CommandPrimitive.Item
                    value="go to verse jump"
                    keywords={["verse", "ayah", "jump", ":", "go"]}
                    onSelect={() => {
                      // Get current search input and try to parse as verse
                      const input = document.querySelector<HTMLInputElement>(
                        "[cmdk-input]",
                      );
                      if (input) handleVerseInput(input.value);
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground aria-selected:bg-surface-hover"
                  >
                    <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">Go to Verse</span>
                    <span className="text-xs text-muted-foreground">
                      e.g. 2:255
                    </span>
                  </CommandPrimitive.Item>
                </CommandPrimitive.Group>

                {/* Navigation: Surahs */}
                <CommandPrimitive.Group heading="Surahs">
                  {surahs.map((surah) => (
                    <CommandPrimitive.Item
                      key={surah.id}
                      value={`${surah.id} ${surah.nameSimple} ${surah.nameArabic} ${surah.nameTranslation}`}
                      onSelect={() => handleSurahSelect(surah)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground aria-selected:bg-surface-hover"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1">
                        {surah.id}. {surah.nameSimple}
                      </span>
                      <span className="text-xs text-muted-foreground" dir="rtl">
                        {surah.nameArabic}
                      </span>
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>

                {/* Settings */}
                <CommandPrimitive.Group heading="Settings">
                  <CommandPrimitive.Item
                    value="toggle dark light mode theme"
                    onSelect={handleThemeToggle}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground aria-selected:bg-surface-hover"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Moon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1">
                      Toggle {theme === "dark" ? "Light" : "Dark"} Mode
                    </span>
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    value="toggle arabic script uthmani simple"
                    onSelect={handleScriptToggle}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground aria-selected:bg-surface-hover"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">Toggle Arabic Script</span>
                    <span className="text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  </CommandPrimitive.Item>
                </CommandPrimitive.Group>
              </CommandPrimitive.List>

              {/* Footer hints */}
              <div className="flex items-center gap-3 border-t border-border px-3 py-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↵
                  </kbd>
                  select
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    esc
                  </kbd>
                  close
                </span>
              </div>
            </CommandPrimitive>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
