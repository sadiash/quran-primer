"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Settings,
  Library,
  Bookmark,
  StickyNote,
  BookOpen,
  BookText,
  Bot,
  ExternalLink,
  PlayCircle,
  PanelRight,
  Palette,
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useProgress } from "@/presentation/hooks/use-progress";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { getSurahName } from "@/lib/surah-names";
import type { PanelId } from "@/core/types/panel";
import type { ThemeName } from "@/core/types";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { name: ThemeName; label: string; mode: "light" | "dark"; swatches: [string, string, string] }[] = [
  { name: "library", label: "Library", mode: "light", swatches: ["hsl(40 33% 96%)", "hsl(36 72% 44%)", "hsl(168 28% 38%)"] },
  { name: "amethyst", label: "Amethyst", mode: "light", swatches: ["hsl(210 40% 98%)", "hsl(265 90% 55%)", "hsl(200 85% 60%)"] },
  { name: "sahara", label: "Sahara", mode: "light", swatches: ["hsl(35 40% 95%)", "hsl(25 80% 50%)", "hsl(168 40% 42%)"] },
  { name: "garden", label: "Garden", mode: "light", swatches: ["hsl(140 30% 97%)", "hsl(145 45% 55%)", "hsl(280 35% 70%)"] },
  { name: "observatory", label: "Observatory", mode: "dark", swatches: ["hsl(225 35% 7%)", "hsl(42 88% 56%)", "hsl(185 55% 48%)"] },
  { name: "cosmos", label: "Cosmos", mode: "dark", swatches: ["hsl(220 25% 8%)", "hsl(200 95% 65%)", "hsl(270 85% 70%)"] },
  { name: "midnight", label: "Midnight", mode: "dark", swatches: ["hsl(0 0% 4%)", "hsl(200 95% 65%)", "hsl(160 90% 50%)"] },
  { name: "matrix", label: "Matrix", mode: "dark", swatches: ["hsl(120 15% 6%)", "hsl(120 100% 50%)", "hsl(120 80% 35%)"] },
];

const PANEL_ITEMS: { id: PanelId; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: "tafsir", icon: BookOpen, label: "Tafsir" },
  { id: "hadith", icon: BookText, label: "Hadith" },
  { id: "notes", icon: StickyNote, label: "Notes" },
  { id: "sources", icon: ExternalLink, label: "Sources" },
  { id: "ai", icon: Bot, label: "AI" },
];

/** Routes where panels are available (reading routes) */
function isReadingRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/surah");
}

interface TopNavProps {
  hidden?: boolean;
}

export function TopNav({ hidden = false }: TopNavProps) {
  const pathname = usePathname();
  const { openPanels, togglePanel } = usePanels();
  const { getLatestProgress } = useProgress();
  const latest = getLatestProgress();
  const showPanels = isReadingRoute(pathname);

  return (
    <header className={cn(
      "relative z-50 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur-sm sm:gap-3 sm:px-4",
      hidden ? "nav-hidden" : "nav-visible",
    )}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <BookOpenText className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-foreground hidden sm:inline">
          The Primer
        </span>
      </Link>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        <NavLink href="/browse" icon={Library} label="Browse" pathname={pathname} />
        <NavLink href="/bookmarks" icon={Bookmark} label="Bookmarks" pathname={pathname} />
        <NavLink href="/notes" icon={StickyNote} label="Notes" pathname={pathname} />
      </nav>

      {/* Continue Reading — hidden when already on a surah page */}
      {latest && !pathname.startsWith("/surah") && (
        <Link
          href={`/surah/${latest.surahId}?verse=${latest.lastVerseKey}`}
          className="hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-fast"
        >
          <PlayCircle className="h-3.5 w-3.5" />
          Continue Surah {getSurahName(latest.surahId)} verse {latest.lastVerseKey.split(":")[1]}
        </Link>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme switcher */}
      <ThemeDropdown />

      {/* Panels dropdown (desktop only, reading routes only) */}
      {showPanels && (
        <PanelsDropdown openPanels={openPanels} onToggle={togglePanel} />
      )}

      {/* Settings */}
      <Link
        href="/settings"
        className="rounded-lg p-2 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </header>
  );
}

function PanelsDropdown({
  openPanels,
  onToggle,
}: {
  openPanels: Set<PanelId>;
  onToggle: (id: PanelId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
      >
        <PanelRight className="h-4 w-4" />
        <span className="hidden sm:inline">Panels</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
            {PANEL_ITEMS.map(({ id, icon: Icon, label }) => {
              const isOpen = openPanels.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggle(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-fast",
                    isOpen
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {isOpen && (
                    <span className="ml-auto text-[10px] text-primary/60">on</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ThemeDropdown() {
  const [open, setOpen] = useState(false);
  const { preferences, updatePreferences } = usePreferences();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1.5 shadow-soft-lg">
            <p className="px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Light</p>
            {THEME_OPTIONS.filter((t) => t.mode === "light").map((theme) => {
              const isActive = preferences.themeName === theme.name;
              return (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    updatePreferences({ themeName: theme.name });
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-fast",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <div className="flex shrink-0 gap-0.5">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {theme.label}
                </button>
              );
            })}
            <div className="my-1 border-t border-border" />
            <p className="px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Dark</p>
            {THEME_OPTIONS.filter((t) => t.mode === "dark").map((theme) => {
              const isActive = preferences.themeName === theme.name;
              return (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    updatePreferences({ themeName: theme.name });
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-fast",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <div className="flex shrink-0 gap-0.5">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {theme.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  pathname: string;
}) {
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-fast",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
