"use client";

import { XIcon } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import type { PanelId } from "@/core/types/panel";
import { cn } from "@/lib/utils";

interface PanelShellProps {
  id: PanelId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function PanelShell({ id, title, icon: Icon, children, className }: PanelShellProps) {
  const { closePanel } = usePanels();

  return (
    <div className={cn("flex h-full flex-col overflow-hidden bg-card", className)}>
      {/* Sticky header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
        <button
          onClick={() => closePanel(id)}
          className="rounded-md p-1 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
          aria-label={`Close ${title} panel`}
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
