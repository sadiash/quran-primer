"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenTextIcon, BookmarkSimpleIcon, BooksIcon, GearSixIcon, NoteIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/surah/1", matchPrefix: "/surah", icon: BookOpenTextIcon, label: "READ" },
  { href: "/browse", matchPrefix: "/browse", icon: BooksIcon, label: "BROWSE" },
  { href: "/bookmarks", matchPrefix: "/bookmarks", icon: BookmarkSimpleIcon, label: "SAVED" },
  { href: "/notes", matchPrefix: "/notes", icon: NoteIcon, label: "NOTES" },
  { href: "/settings", matchPrefix: "/settings", icon: GearSixIcon, label: "MORE" },
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "floating-mobile-nav flex items-center justify-around",
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
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground",
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-[18px] w-[18px]" weight={isActive ? "fill" : "bold"} />
            <span className="font-mono text-[8px] font-bold tracking-widest">
              {item.label}
            </span>
            {isActive && (
              <span className="h-0.5 w-4" style={{ backgroundColor: "#e8e337" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
