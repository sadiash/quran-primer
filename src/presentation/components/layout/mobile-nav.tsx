"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Library, Bookmark, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: BookOpenText, label: "Home" },
  { href: "/surahs", icon: Library, label: "Browse" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "#more", icon: Menu, label: "More" },
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
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
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
