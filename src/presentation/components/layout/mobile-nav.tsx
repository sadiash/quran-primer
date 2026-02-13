"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Library, Bookmark, StickyNote, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/surah/1", matchPrefix: "/surah", icon: BookOpenText, label: "Read" },
  { href: "/browse", matchPrefix: "/browse", icon: Library, label: "Browse" },
  { href: "/bookmarks", matchPrefix: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/notes", matchPrefix: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/settings", matchPrefix: "/settings", icon: Settings, label: "Settings" },
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex h-14 items-center justify-around border-t border-border bg-card/90 backdrop-blur-sm",
        className,
      )}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.matchPrefix);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 transition-fast",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
