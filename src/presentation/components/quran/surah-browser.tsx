"use client";

import { useState, useMemo } from "react";
import type { Surah, RevelationType } from "@/core/types";
import { Input } from "@/presentation/components/ui";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SurahGrid } from "./surah-grid";

interface SurahBrowserProps {
  surahs: Surah[];
}

const filters: Array<{ label: string; value: RevelationType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Makkah", value: "makkah" },
  { label: "Madinah", value: "madinah" },
];

export function SurahBrowser({ surahs }: SurahBrowserProps) {
  const [search, setSearch] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<RevelationType | "all">("all");

  const filtered = useMemo(() => {
    let result = surahs;

    if (revelationFilter !== "all") {
      result = result.filter((s) => s.revelationType === revelationFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.nameSimple.toLowerCase().includes(q) ||
          s.nameTranslation.toLowerCase().includes(q) ||
          s.nameArabic.includes(search.trim()) ||
          String(s.id) === q,
      );
    }

    return result;
  }, [surahs, search, revelationFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search surahs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5">
          {filters.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setRevelationFilter(value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-fast",
                revelationFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SurahGrid surahs={filtered} />
    </div>
  );
}
