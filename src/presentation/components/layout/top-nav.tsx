"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowSquareOutIcon, BookBookmarkIcon, BookOpenIcon, BookmarkSimpleIcon, BooksIcon, GearSixIcon, NoteIcon, PlayCircleIcon, RobotIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import { LogoIcon } from "./logo";
import type { IconWeight } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useProgress } from "@/presentation/hooks/use-progress";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { getSurahName } from "@/lib/surah-names";
import type { PanelId } from "@/core/types/panel";
import { cn } from "@/lib/utils";

const PANEL_ITEMS: { id: PanelId; icon: React.ComponentType<{ className?: string; weight?: IconWeight }>; label: string }[] = [
  { id: "tafsir", icon: BookOpenIcon, label: "TAFSIR" },
  { id: "hadith", icon: BookBookmarkIcon, label: "HADITH" },
  { id: "notes", icon: NoteIcon, label: "NOTES" },
  { id: "sources", icon: ArrowSquareOutIcon, label: "SOURCES" },
  { id: "ai", icon: RobotIcon, label: "AI" },
];

/** Routes where panels are available (reading routes only) */
function isReadingRoute(pathname: string): boolean {
  return pathname.startsWith("/surah");
}

export function TopNav() {
  const pathname = usePathname();
  const { openPanels, togglePanel } = usePanels();
  const { preferences } = usePreferences();
  const { getLatestProgress } = useProgress();
  const latest = getLatestProgress();
  const showPanels = isReadingRoute(pathname);

  return (
    <header className="floating-nav flex h-12 items-center gap-3 px-4 sm:px-6">
      {/* Logo — accented */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-1" style={{ backgroundColor: "#e8e337" }}>
          <LogoIcon className="h-4 w-4 text-[#0a0a0a]" />
        </div>
        <span className="font-mono text-xs font-bold tracking-widest uppercase text-foreground hidden sm:inline">
          THE PRIMER
        </span>
      </Link>

      {/* Separator */}
      <div className="hidden md:block w-px h-5 bg-border/40 ml-1" />

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1 ml-1">
        <NavLink href="/browse" label="BROWSE" pathname={pathname} />
        <NavLink href="/bookmarks" label="SAVED" pathname={pathname} />
        <NavLink href="/notes" label="NOTES" pathname={pathname} />
      </nav>

      {/* Continue Reading */}
      {latest && preferences.trackProgress && !pathname.startsWith("/surah") && (
        <Link
          href={`/surah/${latest.surahId}?verse=${latest.lastVerseKey}`}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "#e8e337" }}
        >
          <PlayCircleIcon weight="bold" className="h-3 w-3" />
          Continue {getSurahName(latest.surahId)} : {latest.lastVerseKey.split(":")[1]}
        </Link>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Panels dropdown (desktop only, reading routes only) */}
      {showPanels && (
        <PanelsDropdown openPanels={openPanels} onToggle={togglePanel} />
      )}

      {/* Settings */}
      <Link
        href="/settings"
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Settings"
      >
        <GearSixIcon weight="bold" className="h-4 w-4" />
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
        className="flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
      >
        <SidebarSimpleIcon weight="bold" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">PANELS</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 border border-border bg-background p-1 shadow-sm">
            {PANEL_ITEMS.map(({ id, icon: Icon, label }) => {
              const isOpen = openPanels.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggle(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-2.5 py-2 font-mono text-[10px] font-bold tracking-wider transition-colors",
                    isOpen
                      ? "bg-[#fefce8] text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" weight={isOpen ? "fill" : "bold"} />
                  {label}
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
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "font-mono text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 transition-all",
        isActive
          ? "text-[#0a0a0a] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
          : "text-muted-foreground hover:text-foreground",
      )}
      style={isActive ? { backgroundColor: "#e8e337" } : undefined}
    >
      {label}
    </Link>
  );
}
