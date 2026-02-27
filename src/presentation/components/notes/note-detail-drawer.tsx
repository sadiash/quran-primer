"use client";

import { useEffect, useCallback } from "react";
import { ArrowSquareOutIcon, BookBookmarkIcon, BookOpenIcon, PencilSimpleIcon, PushPinIcon, PushPinSlashIcon, TagIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
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
  onTogglePin?: (id: string) => void;
}

export function NoteDetailDrawer({
  note,
  open,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
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
          "fixed right-0 top-0 z-50 flex h-full w-[480px] max-w-full flex-col border-l border-border bg-background shadow-md transition-transform duration-200 ease-out",
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
                className="p-1.5 text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <XIcon weight="bold" className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(note.id)}
                    className={cn(
                      "p-1.5 transition-colors",
                      note.pinned
                        ? "text-foreground hover:bg-[#fefce8]"
                        : "text-muted-foreground hover:bg-[#fafafa] hover:text-foreground",
                    )}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    title={note.pinned ? "Unpin note" : "Pin note"}
                  >
                    {note.pinned ? (
                      <PushPinSlashIcon weight="bold" className="h-4 w-4" />
                    ) : (
                      <PushPinIcon weight="fill" className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onEdit}
                  className="p-1.5 text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
                  aria-label="Edit note"
                >
                  <PencilSimpleIcon weight="bold" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Delete note"
                >
                  <TrashIcon weight="bold" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-foreground">
                {note.title || "Untitled Note"}
              </h2>
              {note.pinned && (
                <div className="mt-1 flex items-center gap-1">
                  <PushPinIcon weight="fill" className="h-2.5 w-2.5 text-muted-foreground/60" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
                    Pinned
                  </span>
                </div>
              )}
            </div>

            {/* Reference badges */}
            {(note.verseKeys.length > 0 || note.surahIds.length > 0) && (
              <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
                {note.verseKeys.map((vk) => {
                  const [s, v] = vk.split(":");
                  return (
                    <span
                      key={`vk-${vk}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground"
                      style={{ backgroundColor: '#f0fdf9' }}
                    >
                      <BookOpenIcon weight="duotone" className="h-3 w-3 text-muted-foreground" />
                      {getSurahName(Number(s))} {s}:{v}
                    </span>
                  );
                })}
                {note.surahIds.map((id) => (
                  <span
                    key={`s-${id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: '#fefce8', color: '#b5a600' }}
                  >
                    <BookOpenIcon weight="duotone" className="h-3 w-3" />
                    {getSurahName(id)} (surah)
                  </span>
                ))}
              </div>
            )}

            {/* Body — full content, no line-clamp */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <NoteContentRenderer
                content={note.content}
                contentJson={note.contentJson}
              />

              {/* Linked Resources */}
              {note.linkedResources && note.linkedResources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Linked Resources
                  </p>
                  {note.linkedResources.map((resource, idx) => (
                    <div
                      key={`${resource.type}-${resource.label}-${idx}`}
                      className="border p-3 space-y-1.5"
                      style={{
                        borderLeft: `3px solid ${resource.type === "hadith" ? '#78d5c4' : '#e8e337'}`,
                        borderColor: resource.type === "hadith" ? '#78d5c4' : '#e8e337',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {resource.type === "hadith" ? (
                          <BookBookmarkIcon weight="duotone" className="h-3.5 w-3.5 shrink-0" style={{ color: '#3ba892' }} />
                        ) : (
                          <BookOpenIcon weight="duotone" className="h-3.5 w-3.5 shrink-0" style={{ color: '#b5a600' }} />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {resource.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3">
                        {resource.preview}
                      </p>
                      {resource.sourceUrl && (
                        <a
                          href={resource.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-foreground hover:text-foreground/80 transition-colors"
                        >
                          <ArrowSquareOutIcon weight="bold" className="h-3 w-3" />
                          View on sunnah.com
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — tags + date */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3">
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: '#f5f3ff', color: '#8b6fc0' }}
                      >
                        <TagIcon weight="bold" className="h-2.5 w-2.5" />
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
