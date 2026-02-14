"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Search,
  Palette,
  Settings,
  Library,
  Bookmark,
  StickyNote,
  BookOpen,
  BookText,
  Bot,
  ExternalLink,
  Network,
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useCommandPalette } from "@/presentation/hooks/use-command-palette";
import { ThemeSwitcher } from "@/presentation/components/ui/theme-switcher";
import type { PanelId } from "@/core/types/panel";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const { openPanels, togglePanel } = usePanels();
  const { toggle: togglePalette } = useCommandPalette();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <header className="relative z-50 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur-sm sm:gap-3 sm:px-4">
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
        <NavLink href="/knowledge/mind-map" icon={Network} label="Mind Map" pathname={pathname} />
      </nav>

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

      {/* Panel toggles (desktop only) */}
      <div className="hidden md:flex items-center gap-0.5">
        <PanelToggle id="tafsir" icon={BookOpen} label="Tafsir" isOpen={openPanels.has("tafsir")} onToggle={togglePanel} />
        <PanelToggle id="hadith" icon={BookText} label="Hadith" isOpen={openPanels.has("hadith")} onToggle={togglePanel} />
        <PanelToggle id="notes" icon={StickyNote} label="Notes" isOpen={openPanels.has("notes")} onToggle={togglePanel} />
        <PanelToggle id="sources" icon={ExternalLink} label="Sources" isOpen={openPanels.has("sources")} onToggle={togglePanel} />
        <PanelToggle id="ai" icon={Bot} label="AI" isOpen={openPanels.has("ai")} onToggle={togglePanel} />
      </div>

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

function PanelToggle({
  id,
  icon: Icon,
  label,
  isOpen,
  onToggle,
}: {
  id: PanelId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isOpen: boolean;
  onToggle: (id: PanelId) => void;
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={cn(
        "rounded-md p-1.5 transition-fast",
        isOpen
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
      aria-label={`${isOpen ? "Close" : "Open"} ${label} panel`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
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
