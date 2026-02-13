"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/presentation/hooks/use-study-navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Icon per type
// ---------------------------------------------------------------------------

const typeLabels: Record<BreadcrumbItem["type"], string> = {
  verse: "Verse",
  tafsir: "Tafsir",
  hadith: "Hadith",
  crossref: "Cross-reference",
  note: "Note",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Study navigation"
      className={cn(
        "flex items-center gap-1 overflow-x-auto px-3 py-1.5 text-sm border-b border-border/50 bg-muted/30",
        className,
      )}
    >
      <ol className="flex items-center gap-1" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.id} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current="location"
                  title={`${typeLabels[item.type]}: ${item.label}`}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(index)}
                  className="truncate text-muted-foreground hover:text-foreground transition-fast rounded px-1 -mx-1 hover:bg-muted/50"
                  title={`${typeLabels[item.type]}: ${item.label}`}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
