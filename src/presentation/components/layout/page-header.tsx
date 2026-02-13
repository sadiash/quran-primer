"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
