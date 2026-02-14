"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { StickyNote, Search, Trash2, Tag, Plus } from "lucide-react";
import { useNotes } from "@/presentation/hooks/use-notes";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { NoteDetailDrawer } from "@/presentation/components/notes/note-detail-drawer";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { noteLocationLabel } from "@/core/types/study";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";
import type { Note } from "@/core/types";

export default function NotesPage() {
  const { notes, saveNote, removeNote } = useNotes();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // "new" = creating, note id = editing existing, null = closed
  const [editorMode, setEditorMode] = useState<"new" | string | null>(null);

  const editingNote =
    editorMode && editorMode !== "new"
      ? notes.find((n) => n.id === editorMode) ?? null
      : null;

  // Unique tags across all notes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const n of notes) {
      for (const t of n.tags) tags.add(t);
    }
    return [...tags].sort();
  }, [notes]);

  const filtered = useMemo(() => {
    let result = notes;
    if (tagFilter) {
      result = result.filter((n) => n.tags.includes(tagFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((n) => {
        const vkMatch = n.verseKeys.some((vk) => vk.includes(q));
        const surahMatch = n.surahIds.some((id) =>
          getSurahName(id).toLowerCase().includes(q),
        );
        const vkSurahMatch = n.verseKeys.some((vk) => {
          const sid = Number(vk.split(":")[0]);
          return getSurahName(sid).toLowerCase().includes(q);
        });
        return (
          n.content.toLowerCase().includes(q) ||
          vkMatch ||
          surahMatch ||
          vkSurahMatch ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    return result;
  }, [notes, search, tagFilter]);

  const handleSaveNote = useCallback(
    async (data: {
      content: string;
      contentJson: string;
      tags: string[];
      verseKeys: string[];
      surahIds: number[];
    }) => {
      await saveNote({
        verseKeys: data.verseKeys,
        surahIds: data.surahIds,
        content: data.content,
        contentJson: data.contentJson,
        tags: data.tags,
        id: editorMode !== "new" ? (editorMode ?? undefined) : undefined,
      });
      setEditorMode(null);
    },
    [saveNote, editorMode],
  );

  const handleCancelEditor = useCallback(() => {
    setEditorMode(null);
  }, []);

  const handleEditFromDrawer = useCallback(() => {
    if (selectedNote) {
      setEditorMode(selectedNote.id);
      setSelectedNote(null);
    }
  }, [selectedNote]);

  const handleDeleteFromDrawer = useCallback(
    async (id: string) => {
      await removeNote(id);
      setSelectedNote(null);
    },
    [removeNote],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notes"
          subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          icon={StickyNote}
        />
        {!editorMode && (
          <button
            type="button"
            onClick={() => setEditorMode("new")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        )}
      </div>

      {/* Inline editor — for both new and edit */}
      {editorMode && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-card p-4 shadow-soft-lg">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {editorMode === "new" ? "New Note" : "Edit Note"}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {editorMode === "new"
                ? "Add references to link this note to specific verses or surahs, or leave empty for a standalone note."
                : "Edit content and references below."}
            </p>
          </div>
          <NoteEditor
            key={editorMode}
            initialContent={editingNote?.contentJson ?? editingNote?.content}
            initialTags={editingNote?.tags ?? []}
            initialVerseKeys={editingNote?.verseKeys ?? []}
            initialSurahIds={editingNote?.surahIds ?? []}
            showReferences
            onSave={handleSaveNote}
            onCancel={handleCancelEditor}
          />
        </div>
      )}

      {notes.length > 0 && !editorMode && (
        <>
          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes by content, surah, verse, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setTagFilter(null)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-fast",
                  tagFilter === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                )}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setTagFilter(tagFilter === tag ? null : tag)
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-fast",
                    tagFilter === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Note cards */}
      <div className="mt-6 space-y-2">
        {filtered.map((note) => {
          const label = noteLocationLabel(note, getSurahName);
          const firstVk = note.verseKeys[0];
          const surahNum = firstVk
            ? firstVk.split(":")[0]
            : note.surahIds[0]?.toString();
          return (
            <div
              key={note.id}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft-sm cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  {surahNum && (
                    <Link
                      href={`/surah/${surahNum}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 text-xs text-primary hover:underline"
                    >
                      Go to surah
                    </Link>
                  )}
                  <NoteContentRenderer
                    content={note.content}
                    contentJson={note.contentJson}
                    className="mt-2 line-clamp-4"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">
                      {note.updatedAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNote(note.id);
                  }}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-fast hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {notes.length === 0 && !editorMode && (
        <div className="mt-16 text-center">
          <StickyNote className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            No notes yet. Add notes to verses while reading, or create a
            standalone note.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/surah/1"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
            >
              Start reading
            </Link>
            <button
              type="button"
              onClick={() => setEditorMode("new")}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-fast"
            >
              Create note
            </button>
          </div>
        </div>
      )}

      {notes.length > 0 && filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No notes match your search.
        </p>
      )}

      {/* Detail drawer */}
      <NoteDetailDrawer
        note={selectedNote}
        open={selectedNote !== null}
        onClose={() => setSelectedNote(null)}
        onEdit={handleEditFromDrawer}
        onDelete={handleDeleteFromDrawer}
      />
    </div>
  );
}
