"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string; weight?: IconWeight }>;
}

/**
 * Shared page header with a back button for non-reading pages
 * (Settings, Bookmarks, Notes, Browse, etc.)
 * Uses router.back() so the user returns to whatever they were reading.
 */
export function PageHeader({ title, subtitle, icon: Icon }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.back()}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Go back"
      >
        <ArrowLeftIcon weight="bold" className="h-4 w-4" />
      </button>
      {Icon && <Icon weight="duotone" className="h-5 w-5 text-muted-foreground" />}
      <div>
        <h1 className="text-lg font-bold uppercase tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
