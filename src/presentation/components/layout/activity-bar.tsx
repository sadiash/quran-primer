"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Library,
  Bookmark,
  StickyNote,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: BookOpenText, label: "Home" },
  { href: "/surahs", icon: Library, label: "Browse Surahs" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/knowledge", icon: Brain, label: "Knowledge Map" },
];

interface ActivityBarProps {
  className?: string;
}

export function ActivityBar({ className }: ActivityBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex w-12 flex-col items-center gap-1 border-r border-border bg-sidebar py-3",
        className,
      )}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-fast",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5" />
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-soft-md opacity-0 transition-fast group-hover:opacity-100">
              {item.label}
            </span>
            {/* Active indicator */}
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
