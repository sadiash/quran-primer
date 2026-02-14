"use client";

import { useEffect, useCallback } from "react";
import { X, Pencil, Trash2, BookOpen, Tag } from "lucide-react";
import { NoteContentRenderer } from "./note-content-renderer";
import { noteLocationLabel } from "@/core/types/study";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";
import type { Note } from "@/core/types";

interface NoteDetailDrawerProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function NoteDetailDrawer({
  note,
  open,
  onClose,
  onEdit,
  onDelete,
}: NoteDetailDrawerProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/20 transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[480px] max-w-full flex-col border-l border-border bg-card shadow-soft-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {note && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
                  aria-label="Edit note"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-fast"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Reference badges */}
            {(note.verseKeys.length > 0 || note.surahIds.length > 0) && (
              <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
                {note.verseKeys.map((vk) => {
                  const [s, v] = vk.split(":");
                  return (
                    <span
                      key={`vk-${vk}`}
                      className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      {getSurahName(Number(s))} {s}:{v}
                    </span>
                  );
                })}
                {note.surahIds.map((id) => (
                  <span
                    key={`s-${id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    <BookOpen className="h-3 w-3" />
                    {getSurahName(id)} (surah)
                  </span>
                ))}
              </div>
            )}

            {/* Body — full content, no line-clamp */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <NoteContentRenderer
                content={note.content}
                contentJson={note.contentJson}
              />
            </div>

            {/* Footer — tags + date */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3">
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="ml-auto text-xs text-muted-foreground/60">
                  {note.updatedAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {note.verseKeys.length === 0 && note.surahIds.length === 0 && (
                <span className="mt-1 block text-xs text-muted-foreground/50">
                  Standalone note
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
