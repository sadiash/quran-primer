"use client";

import { useCallback } from "react";
import { Check, Palette } from "lucide-react";
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

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Palette className="h-3.5 w-3.5" />
        Themes
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {THEMES.map((theme) => {
          const isActive = preferences.themeName === theme.name;
          return (
            <button
              key={theme.name}
              onClick={() => selectTheme(theme.name)}
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
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
              <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] font-medium text-muted-foreground uppercase">
                {theme.mode}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
