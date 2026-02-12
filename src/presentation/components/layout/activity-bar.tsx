"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Bookmark, StickyNote, Search, Settings, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/presentation/components/ui";
import { IconButton } from "@/presentation/components/ui";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/surahs", label: "Surahs", icon: BookOpen },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface ActivityBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ActivityBar({ collapsed, onToggle }: ActivityBarProps) {
  const pathname = usePathname();

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
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
        </IconButton>
      </div>

      <nav className="flex flex-col gap-1 px-1.5" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          const linkContent = (
            <Link
              href={href}
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
    </aside>
  );
}
