"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";

export const FROM_MAP: Record<string, { label: string; href: string }> = {
  browse: { label: "Go back to Browse", href: "/browse" },
  bookmarks: { label: "Go back to Bookmarks", href: "/bookmarks" },
  notes: { label: "Go back to Notes", href: "/notes" },
  mindmap: { label: "Go back to Mind Map", href: "/knowledge/mind-map" },
  concepts: { label: "Go back to Concepts", href: "/browse?tab=concepts" },
};

interface NavigationPillProps {
  from: string;
}

export function NavigationPill({ from }: NavigationPillProps) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (!FROM_MAP[from] || dismissed) return null;

  const { label, href } = FROM_MAP[from];

  const handleClick = () => {
    // Use browser back to preserve the previous page's scroll position and state.
    // Falls back to router.push if there's no history (e.g. shared/direct link with ?from=).
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <div className="sticky top-0 z-20 px-6 sm:px-8 lg:px-12 py-2 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        <div
          className="nav-pill inline-flex items-center gap-0.5 border-2 cursor-pointer"
          style={{
            borderColor: "var(--surah-pink-accent)",
            backgroundColor: "var(--surah-pink-bg)",
          }}
        >
          <button
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
            style={{ color: "var(--surah-pink-label)" }}
          >
            <span aria-hidden="true">&larr;</span>
            {label}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="pr-2 pl-0 py-1.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--surah-pink-label)" }}
            aria-label="Dismiss"
          >
            <XIcon weight="bold" className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
