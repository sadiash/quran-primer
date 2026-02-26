"use client";

import { CaretRightIcon } from "@phosphor-icons/react";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PanelBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function PanelBreadcrumb({ items }: PanelBreadcrumbProps) {
  if (items.length <= 1) return null;

  // If more than 4 items, truncate middle
  const display =
    items.length > 4
      ? [items[0]!, { label: "...", onClick: undefined }, ...items.slice(-2)]
      : items;

  return (
    <nav className="flex items-center gap-0.5 text-[11px] text-muted-foreground/70 mb-2 min-w-0">
      {display.map((item, i) => {
        const isLast = i === display.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-0.5 min-w-0">
            {i > 0 && (
              <CaretRightIcon className="h-3 w-3 shrink-0 text-muted-foreground/30" />
            )}
            {isLast || !item.onClick ? (
              <span
                className={
                  isLast
                    ? "truncate font-medium text-foreground/80"
                    : "truncate"
                }
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="truncate hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
