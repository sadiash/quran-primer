"use client";

import { useCallback } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/core/types";

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  mode: "light" | "dark";
  swatches: [string, string, string];
}

const THEMES: ThemeOption[] = [
  {
    name: "library",
    label: "The Library",
    description: "Warm ivory, gold accents",
    mode: "light",
    swatches: ["hsl(40 33% 96%)", "hsl(36 72% 44%)", "hsl(168 28% 38%)"],
  },
  {
    name: "observatory",
    label: "The Observatory",
    description: "Deep navy, amber glow",
    mode: "dark",
    swatches: ["hsl(225 35% 7%)", "hsl(42 88% 56%)", "hsl(185 55% 48%)"],
  },
  {
    name: "amethyst",
    label: "Amethyst",
    description: "Frosted periwinkle, purple",
    mode: "light",
    swatches: ["hsl(210 40% 98%)", "hsl(265 90% 55%)", "hsl(200 85% 60%)"],
  },
  {
    name: "cosmos",
    label: "Cosmos",
    description: "Cosmic blue, cyan glow",
    mode: "dark",
    swatches: ["hsl(220 25% 8%)", "hsl(200 95% 65%)", "hsl(270 85% 70%)"],
  },
  {
    name: "midnight",
    label: "Midnight",
    description: "True black OLED, ice cyan",
    mode: "dark",
    swatches: ["hsl(0 0% 4%)", "hsl(200 95% 65%)", "hsl(160 90% 50%)"],
  },
  {
    name: "sahara",
    label: "Sahara",
    description: "Warm sand, terracotta",
    mode: "light",
    swatches: ["hsl(35 40% 95%)", "hsl(25 80% 50%)", "hsl(168 40% 42%)"],
  },
  {
    name: "garden",
    label: "Garden",
    description: "Soft mint, pastel green",
    mode: "light",
    swatches: ["hsl(140 30% 97%)", "hsl(145 45% 55%)", "hsl(280 35% 70%)"],
  },
  {
    name: "matrix",
    label: "Matrix",
    description: "Terminal green, phosphor",
    mode: "dark",
    swatches: ["hsl(120 15% 6%)", "hsl(120 100% 50%)", "hsl(120 80% 35%)"],
  },
];

export interface ThemeSwitcherProps {
  className?: string;
  onSelect?: () => void;
}

export function ThemeSwitcher({ className, onSelect }: ThemeSwitcherProps) {
  const { preferences, updatePreferences } = usePreferences();

  const selectTheme = useCallback(
    async (name: ThemeName) => {
      await updatePreferences({ themeName: name });
      onSelect?.();
    },
    [updatePreferences, onSelect],
  );

  const lightThemes = THEMES.filter((t) => t.mode === "light");
  const darkThemes = THEMES.filter((t) => t.mode === "dark");

  return (
    <div className={cn("space-y-5", className)}>
      {/* Light themes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          Light
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {lightThemes.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={preferences.themeName === theme.name}
              onSelect={() => selectTheme(theme.name)}
            />
          ))}
        </div>
      </div>

      {/* Dark themes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          Dark
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {darkThemes.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={preferences.themeName === theme.name}
              onSelect={() => selectTheme(theme.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Theme card ─── */

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-fast",
        "hover:bg-surface-hover",
        isActive && "bg-surface-active ring-1 ring-primary/30",
      )}
    >
      <div className="flex shrink-0 gap-0.5">
        {theme.swatches.map((color, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full border border-border/50",
              i === 0 ? "h-5 w-5" : "h-4 w-4",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-foreground">
          {theme.label}
        </div>
        <div className="truncate text-[10px] text-muted-foreground">
          {theme.description}
        </div>
      </div>
      {isActive && (
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
      )}
    </button>
  );
}
