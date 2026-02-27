"use client";

import { useState, useRef, useEffect } from "react";
import { BookBookmarkIcon, BookOpenIcon, BookmarkSimpleIcon, CopyIcon, DotsThreeIcon, LinkSimpleIcon, NoteIcon, PauseIcon, PlayIcon, TranslateIcon } from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";
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
          className="p-1.5 text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon weight="fill" className="h-3.5 w-3.5" />
          ) : (
            <PlayIcon weight="fill" className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          className={cn(
            "p-1.5 transition-colors",
            isBookmarked
              ? "text-foreground"
              : "text-muted-foreground hover:bg-[#fafafa] hover:text-foreground",
          )}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <BookmarkSimpleIcon weight="fill" className="h-3.5 w-3.5" />
          ) : (
            <BookmarkSimpleIcon weight="duotone" className="h-3.5 w-3.5" />
          )}
        </button>

        {/* More menu trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
            setShowLinkMenu(false);
          }}
          className="p-1.5 text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
          aria-label="More actions"
        >
          <DotsThreeIcon weight="bold" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dropdown menu */}
      {open && !showLinkMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-border bg-background p-1 shadow-md animate-scale-in">
          <MenuItem
            icon={BookOpenIcon}
            label="Open Tafsir"
            onClick={() =>
              handleAction(() => {
                focusVerse(verseKey);
                openPanel("tafsir");
              })
            }
          />
          <MenuItem
            icon={BookBookmarkIcon}
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
            icon={NoteIcon}
            label="Add Note"
            onClick={() => handleAction(() => {
              focusVerse(verseKey);
              openPanel("notes");
            })}
          />
          <MenuItem
            icon={LinkSimpleIcon}
            label="Link to Note"
            onClick={() => setShowLinkMenu(true)}
          />
          <div className="my-1 h-px bg-border" />
          <MenuItem
            icon={CopyIcon}
            label="Copy Arabic"
            onClick={() => copyToClipboard(arabicText)}
          />
          <MenuItem
            icon={TranslateIcon}
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
        <div className="absolute right-0 top-full z-50 mt-1 border border-border bg-background shadow-md animate-scale-in">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <button
              type="button"
              onClick={() => setShowLinkMenu(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
  icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
    >
      <Icon className="h-3.5 w-3.5" weight="duotone" />
      {label}
    </button>
  );
}
