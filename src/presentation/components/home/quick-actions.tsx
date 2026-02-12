"use client";

import Link from "next/link";
import { BookOpen, Star, Search, Bookmark } from "lucide-react";

const actions = [
  {
    href: "/surahs",
    label: "Browse Surahs",
    icon: BookOpen,
  },
  {
    href: "/surahs/1",
    label: "Al-Fatihah",
    icon: Star,
  },
  {
    href: "/surahs/2#verse-2:255",
    label: "Ayat al-Kursi",
    icon: Bookmark,
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="glass flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-smooth hover:shadow-glow"
        >
          <Icon className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
}
