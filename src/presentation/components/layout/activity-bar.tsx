"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Bookmark,
  StickyNote,
  Brain,
  Search,
  Settings,
  PanelLeft,
  PanelLeftClose,
  BookOpenCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/presentation/components/ui";
import { IconButton } from "@/presentation/components/ui";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import { AddPanelMenu } from "./add-panel-menu";
import { WorkspacePresetPicker } from "./workspace-preset-picker";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/surahs", label: "Surahs", icon: BookOpen },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/knowledge", label: "Knowledge", icon: Brain },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface ActivityBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ActivityBar({ collapsed, onToggle }: ActivityBarProps) {
  const pathname = usePathname();
  const ws = useWorkspace();
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const panelBtnRef = useRef<HTMLButtonElement>(null);
  const presetBtnRef = useRef<HTMLButtonElement>(null);

  const openPanelCount = ws.openPanelCount;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-smooth",
        collapsed ? "w-12" : "w-60",
      )}
    >
      <div className="flex items-center justify-end p-1.5">
        <IconButton
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
        </IconButton>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-1.5"
        aria-label="Main navigation"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          const linkContent = (
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-fast",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={href} content={label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return <div key={href}>{linkContent}</div>;
        })}
      </nav>

      {/* Study panel controls at bottom */}
      <div className="relative px-1.5 pb-2 space-y-1">
        {/* Panel menu button */}
        <div className="relative">
          {collapsed ? (
            <Tooltip content="Open study panel" side="right">
              <button
                ref={panelBtnRef}
                type="button"
                onClick={() => {
                  setPanelMenuOpen(!panelMenuOpen);
                  setPresetMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-fast w-full relative",
                  ws.state.studyRegionOpen
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                aria-label="Open study panel"
              >
                <BookOpenCheck className="h-4 w-4 shrink-0" />
                {openPanelCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {openPanelCount}
                  </span>
                )}
              </button>
            </Tooltip>
          ) : (
            <button
              ref={panelBtnRef}
              type="button"
              onClick={() => {
                setPanelMenuOpen(!panelMenuOpen);
                setPresetMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-fast w-full relative",
                ws.state.studyRegionOpen
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <BookOpenCheck className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Study Panels</span>
              {openPanelCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {openPanelCount}
                </span>
              )}
            </button>
          )}

          <AddPanelMenu
            open={panelMenuOpen}
            onClose={() => setPanelMenuOpen(false)}
            anchorRef={panelBtnRef}
          />
        </div>

        {/* Workspace presets button */}
        {!collapsed && (
          <div className="relative">
            <button
              ref={presetBtnRef}
              type="button"
              onClick={() => {
                setPresetMenuOpen(!presetMenuOpen);
                setPanelMenuOpen(false);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setPresetMenuOpen(!presetMenuOpen);
                setPanelMenuOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-fast w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="text-xs text-muted-foreground">Workspace presets</span>
            </button>

            <WorkspacePresetPicker
              open={presetMenuOpen}
              onClose={() => setPresetMenuOpen(false)}
              anchorRef={presetBtnRef}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
