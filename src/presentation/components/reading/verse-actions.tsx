"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  BookOpen,
  BookText,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Link2,
  Copy,
  Languages,
  Play,
  Pause,
} from "lucide-react";
import type { Translation } from "@/core/types";
import { usePanels } from "@/presentation/providers/panel-provider";
import { LinkToNoteMenu } from "@/presentation/components/notes/link-to-note-menu";
import { cn } from "@/lib/utils";

interface VerseActionsProps {
  verseKey: string;
  arabicText: string;
  translations: Translation[];
  isBookmarked: boolean;
  isPlaying: boolean;
  onToggleBookmark: () => void;
  onPlay: () => void;
}

export function VerseActions({
  verseKey,
  arabicText,
  translations,
  isBookmarked,
  isPlaying,
  onToggleBookmark,
  onPlay,
}: VerseActionsProps) {
  const [open, setOpen] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openPanel, focusVerse } = usePanels();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowLinkMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleAction(action: () => void) {
    action();
    setOpen(false);
    setShowLinkMenu(false);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback: do nothing
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Quick actions — always visible on hover */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          className={cn(
            "rounded-md p-1.5 transition-fast",
            isBookmarked
              ? "text-primary"
              : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
          )}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-3.5 w-3.5" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" />
          )}
        </button>

        {/* More menu trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
            setShowLinkMenu(false);
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dropdown menu */}
      {open && !showLinkMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-soft-lg animate-scale-in">
          <MenuItem
            icon={BookOpen}
            label="Open Tafsir"
            onClick={() =>
              handleAction(() => {
                focusVerse(verseKey);
                openPanel("tafsir");
              })
            }
          />
          <MenuItem
            icon={BookText}
            label="Open Hadith"
            onClick={() =>
              handleAction(() => {
                focusVerse(verseKey);
                openPanel("hadith");
              })
            }
          />
          <div className="my-1 h-px bg-border" />
          <MenuItem
            icon={StickyNote}
            label="Add Note"
            onClick={() => handleAction(() => {
              focusVerse(verseKey);
              openPanel("notes");
            })}
          />
          <MenuItem
            icon={Link2}
            label="Link to Note"
            onClick={() => setShowLinkMenu(true)}
          />
          <div className="my-1 h-px bg-border" />
          <MenuItem
            icon={Copy}
            label="Copy Arabic"
            onClick={() => copyToClipboard(arabicText)}
          />
          <MenuItem
            icon={Languages}
            label="Copy Translation"
            onClick={() => {
              const text = translations
                .map((t) => {
                  // Strip HTML tags to get plain text
                  const plain = t.text.replace(/<[^>]+>/g, "");
                  return `[${t.resourceName}] ${plain}`;
                })
                .join("\n\n");
              copyToClipboard(text || verseKey);
            }}
          />
        </div>
      )}

      {/* Link to note submenu */}
      {open && showLinkMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card shadow-soft-lg animate-scale-in">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <button
              type="button"
              onClick={() => setShowLinkMenu(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-fast"
            >
              Back
            </button>
            <span className="text-xs font-medium text-foreground">
              Link to Note
            </span>
          </div>
          <LinkToNoteMenu
            verseKey={verseKey}
            onLinked={() => {
              setOpen(false);
              setShowLinkMenu(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
