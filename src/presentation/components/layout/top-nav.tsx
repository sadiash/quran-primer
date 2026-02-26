"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowSquareOutIcon, BookBookmarkIcon, BookOpenIcon, BookmarkSimpleIcon, BooksIcon, GearSixIcon, NoteIcon, PaletteIcon, PlayCircleIcon, RobotIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import { LogoIcon } from "./logo";
import type { IconWeight } from "@phosphor-icons/react";
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

const PANEL_ITEMS: { id: PanelId; icon: React.ComponentType<{ className?: string; weight?: IconWeight }>; label: string }[] = [
  { id: "tafsir", icon: BookOpenIcon, label: "Tafsir" },
  { id: "hadith", icon: BookBookmarkIcon, label: "Hadith" },
  { id: "notes", icon: NoteIcon, label: "Notes" },
  { id: "sources", icon: ArrowSquareOutIcon, label: "Sources" },
  { id: "ai", icon: RobotIcon, label: "AI" },
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
      "floating-nav flex h-11 items-center gap-2 px-3 sm:gap-3 sm:px-4",
      hidden ? "nav-hidden" : "nav-visible",
    )}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <LogoIcon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
        <span className="text-[13px] font-semibold tracking-tight text-foreground hidden sm:inline">
          The Primer
        </span>
      </Link>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-0.5 ml-3">
        <NavLink href="/browse" icon={BooksIcon} label="Browse" pathname={pathname} />
        <NavLink href="/bookmarks" icon={BookmarkSimpleIcon} label="Bookmarks" pathname={pathname} />
        <NavLink href="/notes" icon={NoteIcon} label="Notes" pathname={pathname} />
      </nav>

      {/* Continue Reading — hidden when already on a surah page */}
      {latest && !pathname.startsWith("/surah") && (
        <Link
          href={`/surah/${latest.surahId}?verse=${latest.lastVerseKey}`}
          className="hidden md:flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-primary bg-primary/8 hover:bg-primary/12 transition-all"
        >
          <PlayCircleIcon weight="bold" className="h-3 w-3" />
          Continue {getSurahName(latest.surahId)} : {latest.lastVerseKey.split(":")[1]}
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

      {/* GearSixIcon */}
      <Link
        href="/settings"
        className="rounded-full p-1.5 text-muted-foreground/70 transition-all hover:bg-surface-hover hover:text-foreground"
        aria-label="Settings"
      >
        <GearSixIcon weight="duotone" className="h-3.5 w-3.5" />
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
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground/70 transition-all hover:bg-surface-hover hover:text-foreground"
      >
        <SidebarSimpleIcon weight="duotone" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Panels</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-1.5 shadow-soft-lg">
            {PANEL_ITEMS.map(({ id, icon: Icon, label }) => {
              const isOpen = openPanels.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggle(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] transition-all",
                    isOpen
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" weight={isOpen ? "fill" : "duotone"} />
                  {label}
                  {isOpen && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground/70 transition-all hover:bg-surface-hover hover:text-foreground"
        aria-label="Change theme"
      >
        <PaletteIcon weight="duotone" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Theme</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-2 shadow-soft-lg">
            <p className="px-2.5 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">Light</p>
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
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all",
                    isActive
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <div className="flex shrink-0 -space-x-0.5">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border-2 border-card"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {theme.label}
                </button>
              );
            })}
            <div className="my-1.5 border-t border-border/30" />
            <p className="px-2.5 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">Dark</p>
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
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all",
                    isActive
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <div className="flex shrink-0 -space-x-0.5">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border-2 border-card"
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
  icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
  label: string;
  pathname: string;
}) {
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all",
        isActive
          ? "bg-primary/8 text-primary"
          : "text-muted-foreground/70 hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <Icon className="h-3 w-3" weight={isActive ? "fill" : "duotone"} />
      {label}
    </Link>
  );
}
