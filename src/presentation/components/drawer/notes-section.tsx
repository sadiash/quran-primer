"use client";

import { useState, useCallback } from "react";
import {
  StickyNote,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  BookOpen,
  Link2,
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useNotes } from "@/presentation/hooks/use-notes";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { getSurahName } from "@/lib/surah-names";
import { noteLocationLabel } from "@/core/types/study";
import { cn } from "@/lib/utils";
import type { Note } from "@/core/types";

export function NotesSection() {
  const { focusedVerseKey } = usePanels();

  if (!focusedVerseKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-8 text-muted-foreground/70">
        <StickyNote className="h-4 w-4 shrink-0" />
        <p className="text-xs">Select a verse to view and add notes</p>
      </div>
    );
  }

  return <NotesContent key={focusedVerseKey} verseKey={focusedVerseKey} />;
}

// ─── Inner component — remounts on verse change (React Compiler safe) ───

interface NotesContentProps {
  verseKey: string;
}

function NotesContent({ verseKey }: NotesContentProps) {
  const [, verseNum] = verseKey.split(":");
  const surahId = Number(verseKey.split(":")[0]);
  const surahName = getSurahName(surahId);

  const { notes, saveNote, removeNote, addVerseToNote } = useNotes({
    verseKey,
  });
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const editingNote = editingNoteId
    ? notes.find((n) => n.id === editingNoteId) ?? null
    : null;

  const handleNewNote = useCallback(() => {
    setEditingNoteId(null);
    setMode("editor");
  }, []);

  const handleEditNote = useCallback((id: string) => {
    setEditingNoteId(id);
    setMode("editor");
  }, []);

  const handleCancel = useCallback(() => {
    setMode("list");
    setEditingNoteId(null);
  }, []);

  const handleSave = useCallback(
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
        id: editingNoteId ?? undefined,
      });
      setMode("list");
      setEditingNoteId(null);
    },
    [saveNote, editingNoteId],
  );

  /** One-click toggle: link/unlink note to the whole surah */
  const handleToggleSurahLink = useCallback(
    async (note: Note) => {
      const linked = note.surahIds.includes(surahId);
      await saveNote({
        verseKeys: note.verseKeys,
        surahIds: linked
          ? note.surahIds.filter((id) => id !== surahId)
          : [...note.surahIds, surahId],
        content: note.content,
        contentJson: note.contentJson,
        tags: note.tags,
        id: note.id,
      });
    },
    [surahId, saveNote],
  );

  // ─── Editor mode ───
  if (mode === "editor") {
    return (
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
            aria-label="Back to list"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-foreground">
            {editingNote ? "Edit Note" : "New Note"}
          </span>
        </div>
        <NoteEditor
          key={editingNoteId ?? "new"}
          initialContent={editingNote?.contentJson ?? editingNote?.content}
          initialTags={editingNote?.tags ?? []}
          initialVerseKeys={editingNote?.verseKeys ?? [verseKey]}
          initialSurahIds={editingNote?.surahIds ?? []}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // ─── List mode ───
  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {surahName} — Verse {verseNum}
        </span>
        <button
          type="button"
          onClick={handleNewNote}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-fast"
        >
          <Plus className="h-3.5 w-3.5" />
          New Note
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <StickyNote className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">
            No notes for this verse yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              surahId={surahId}
              surahName={surahName}
              onEdit={handleEditNote}
              onDelete={removeNote}
              onToggleSurahLink={handleToggleSurahLink}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Note card in list ───

interface NoteCardProps {
  note: Note;
  surahId: number;
  surahName: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSurahLink: (note: Note) => void;
}

function NoteCard({
  note,
  surahId,
  surahName,
  onEdit,
  onDelete,
  onToggleSurahLink,
}: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLinkedToSurah = note.surahIds.includes(surahId);
  const totalRefs = note.verseKeys.length + note.surahIds.length;

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3",
        "transition-all hover:border-primary/30 hover:shadow-soft-sm",
      )}
    >
      {/* Reference badges when note links to multiple places */}
      {totalRefs > 1 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <BookOpen className="h-2.5 w-2.5" />
            {noteLocationLabel(note, getSurahName)}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <NoteContentRenderer
          content={note.content}
          contentJson={note.contentJson}
          className={expanded ? undefined : "line-clamp-2"}
        />
      </button>

      <div className="mt-2 flex items-center gap-2">
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Surah link toggle */}
        <button
          type="button"
          onClick={() => onToggleSurahLink(note)}
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-fast",
            isLinkedToSurah
              ? "bg-primary/15 text-primary"
              : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
          title={
            isLinkedToSurah
              ? `Linked to ${surahName} — click to unlink`
              : `Link to all of ${surahName}`
          }
        >
          <Link2 className="h-2.5 w-2.5" />
          {surahName}
        </button>

        <span className="text-[10px] text-muted-foreground/60">
          {note.updatedAt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Edit / Delete actions */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 transition-fast group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(note.id)}
          className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
          aria-label="Edit note"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(note.id)}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-fast"
          aria-label="Delete note"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
