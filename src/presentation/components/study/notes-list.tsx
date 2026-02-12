"use client";

import { useState, useMemo } from "react";
import { useNotes } from "@/presentation/hooks/use-notes";
import { Badge, Input, Skeleton, EmptyState } from "@/presentation/components/ui";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSurahName } from "@/lib/surah-names";
import { NoteEditorDialog } from "./note-editor-dialog";
import type { Note } from "@/core/types";

export function NotesList() {
  const { notes } = useNotes();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    let result = notes;

    if (selectedTag) {
      result = result.filter((n) => n.tags.includes(selectedTag));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.content.toLowerCase().includes(q) ||
          n.verseKey.includes(q),
      );
    }

    return result;
  }, [notes, selectedTag, search]);

  if (notes === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet."
        description="Tap the note icon on any verse to create one."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-fast",
                selectedTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-fast",
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No notes match your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => {
            const [surahId, verseNum] = note.verseKey.split(":");
            const surahName = getSurahName(Number(surahId));

            return (
              <button
                key={note.id}
                onClick={() => setEditingNote(note)}
                className="glass w-full rounded-xl p-4 text-left transition-smooth hover:shadow-glow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {surahName} — Verse {verseNum}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {note.updatedAt.toLocaleDateString()}
                  </span>
                </div>
                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {editingNote && (
        <NoteEditorDialog
          open={!!editingNote}
          onClose={() => setEditingNote(null)}
          verseKey={editingNote.verseKey}
          surahId={editingNote.surahId}
          existingNote={editingNote}
        />
      )}
    </div>
  );
}
