"use client";

import { useState } from "react";
import { BookOpenText, Search, Palette, Settings, PanelRightOpen, PanelRightClose } from "lucide-react";
import { useWorkspace } from "@/presentation/providers";
import { useCommandPalette } from "@/presentation/hooks/use-command-palette";
import { ThemeSwitcher } from "@/presentation/components/ui/theme-switcher";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { state, toggleStudyRegion } = useWorkspace();
  const { toggle: togglePalette } = useCommandPalette();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <header className="relative flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <BookOpenText className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-foreground hidden sm:inline">
          The Primer
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={togglePalette}
        className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-fast hover:bg-surface-hover"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "\u2318K" : "Ctrl+K"}
        </kbd>
      </button>

      {/* Theme switcher */}
      <div className="relative">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="rounded-lg p-2 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
          aria-label="Change theme"
        >
          <Palette className="h-4 w-4" />
        </button>
        {showThemes && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowThemes(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-border bg-card p-3 shadow-soft-lg animate-scale-in">
              <ThemeSwitcher onSelect={() => setShowThemes(false)} />
            </div>
          </>
        )}
      </div>

      {/* Toggle study region */}
      <button
        onClick={toggleStudyRegion}
        className={cn(
          "hidden md:flex rounded-lg p-2 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground",
          state.studyRegionOpen && "text-primary",
        )}
        aria-label={state.studyRegionOpen ? "Close study panels" : "Open study panels"}
      >
        {state.studyRegionOpen ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelRightOpen className="h-4 w-4" />
        )}
      </button>

      {/* Settings */}
      <button
        className="rounded-lg p-2 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    </header>
  );
}
