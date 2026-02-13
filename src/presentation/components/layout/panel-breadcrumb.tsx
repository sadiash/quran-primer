"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import type { PanelInstance } from "@/core/types/workspace";

interface PanelBreadcrumbProps {
  panel: PanelInstance;
  className?: string;
}

export function PanelBreadcrumb({ panel, className }: PanelBreadcrumbProps) {
  const ws = useWorkspace();

  if (panel.breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Panel navigation"
      className={cn(
        "flex items-center gap-1 overflow-x-auto px-3 py-1 text-xs border-b border-border/50 bg-muted/20",
        className,
      )}
    >
      <ol className="flex items-center gap-1" role="list">
        {panel.breadcrumbs.map((item, index) => {
          const isLast = index === panel.breadcrumbs.length - 1;
          return (
            <li key={item.id} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => ws.gotoBreadcrumb(panel.id, index)}
                  className="truncate text-muted-foreground hover:text-foreground transition-fast rounded px-1 -mx-1 hover:bg-muted/50"
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
