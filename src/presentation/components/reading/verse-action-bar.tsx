"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VerseActionBarProps {
  isBookmarked: boolean;
  hasNotes: boolean;
  isPlaying: boolean;
  isFocused: boolean;
  onToggleBookmark: () => void;
  onOpenNotes: () => void;
  onTogglePlay: () => void;
  onCopy: () => void;
  onStudy: () => void;
}

export function VerseActionBar({
  isBookmarked,
  hasNotes,
  isPlaying,
  isFocused,
  onToggleBookmark,
  onOpenNotes,
  onTogglePlay,
  onCopy,
  onStudy,
}: VerseActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={cn(
        "verse-action-bar absolute -top-2 right-2 z-10 flex items-center gap-0.5 rounded-full px-2 py-1 glass",
        isFocused && "is-visible",
      )}
    >
      <ActionButton
        onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
        active={isBookmarked}
        label={isBookmarked ? "Remove bookmark" : "Bookmark"}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      </ActionButton>

      <ActionButton
        onClick={(e) => { e.stopPropagation(); onOpenNotes(); }}
        active={hasNotes}
        activeClass="text-amber-500/80"
        label={hasNotes ? "View notes" : "Add note"}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={hasNotes ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
          <path d="M15 3v4a2 2 0 0 0 2 2h4" />
        </svg>
      </ActionButton>

      <ActionButton
        onClick={(e) => { e.stopPropagation(); onStudy(); }}
        label="Open tafsir"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </ActionButton>

      <ActionButton
        onClick={handleCopy}
        active={copied}
        activeClass="text-green-500"
        label="Copy"
      >
        {copied ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </ActionButton>

      <ActionButton
        onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
        active={isPlaying}
        label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        )}
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  active = false,
  activeClass = "text-primary",
  label,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  activeClass?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full p-1.5 transition-all hover:bg-surface-hover",
        active
          ? activeClass
          : "text-muted-foreground/50 hover:text-foreground",
      )}
      aria-label={label}
    >
      {children}
    </button>
  );
}
