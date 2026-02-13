"use client";

import Link from "next/link";
import { StickyNote, Trash2 } from "lucide-react";
import { useNotes } from "@/presentation/hooks/use-notes";
import { cn } from "@/lib/utils";

export function NotesList() {
  const { notes, removeNote } = useNotes();

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <StickyNote className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No notes yet. Create notes while studying to build your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => {
        const [surahId] = note.verseKey.split(":");
        return (
          <div
            key={note.id}
            className={cn(
              "group flex items-start gap-3 rounded-lg border border-border bg-card p-3",
              "transition-all hover:shadow-soft-sm hover:border-primary/30",
            )}
          >
            <Link
              href={`/surahs/${surahId}`}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-foreground">
                Verse {note.verseKey}
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {note.content}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-[10px] text-muted-foreground">
                  {note.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </Link>
            <button
              onClick={() => removeNote(note.id)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove note"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
