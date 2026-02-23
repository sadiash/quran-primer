"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Library, Bookmark, StickyNote, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/surah/1", matchPrefix: "/surah", icon: BookOpenText, label: "Read" },
  { href: "/browse", matchPrefix: "/browse", icon: Library, label: "Browse" },
  { href: "/bookmarks", matchPrefix: "/bookmarks", icon: Bookmark, label: "Saved" },
  { href: "/notes", matchPrefix: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/settings", matchPrefix: "/settings", icon: Settings, label: "More" },
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "floating-mobile-nav flex items-center gap-1",
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
              "relative flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-1.5 transition-all",
              isActive
                ? "text-primary"
                : "text-muted-foreground/60 active:scale-95",
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className={cn("h-[18px] w-[18px] transition-transform", isActive && "scale-110")} />
            <span className={cn(
              "text-[9px] font-medium tracking-wide",
              isActive && "font-semibold",
            )}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary/60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
