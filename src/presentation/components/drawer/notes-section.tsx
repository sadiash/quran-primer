"use client";

import { useState, useCallback, useRef } from "react";
import {
  StickyNote,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  BookOpen,
  Link2,
  MessageSquare,
  HelpCircle,
  Link,
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
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <StickyNote className="h-6 w-6 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/60">
          Select a verse to view and add notes
        </p>
      </div>
    );
  }

  return <NotesContent key={focusedVerseKey} verseKey={focusedVerseKey} />;
}

// ─── Inner component — remounts on verse change (React Compiler safe) ───

interface NotesContentProps {
  verseKey: string;
}

const QUICK_PROMPTS = [
  { icon: MessageSquare, label: "Reflection", placeholder: "What stood out to me..." },
  { icon: HelpCircle, label: "Question", placeholder: "I want to understand..." },
  { icon: Link, label: "Connection", placeholder: "This connects to..." },
];

function NotesContent({ verseKey }: NotesContentProps) {
  const [, verseNum] = verseKey.split(":");
  const surahId = Number(verseKey.split(":")[0]);
  const surahName = getSurahName(surahId);

  const { notes, saveNote, removeNote, addVerseToNote } = useNotes({
    verseKey,
  });
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [quickText, setQuickText] = useState("");
  const [quickPlaceholder, setQuickPlaceholder] = useState("Add a quick note...");
  const quickInputRef = useRef<HTMLTextAreaElement>(null);

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

  /** Quick save: single text, auto-linked to verse */
  const handleQuickSave = useCallback(async () => {
    const text = quickText.trim();
    if (!text) return;
    await saveNote({
      verseKeys: [verseKey],
      surahIds: [],
      content: text,
      contentJson: "",
      tags: [],
    });
    setQuickText("");
    setQuickPlaceholder("Add a quick note...");
  }, [quickText, verseKey, saveNote]);

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
    <div className="flex flex-col gap-3 p-3">
      {/* Header with accent */}
      <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-primary/60" />
          <span className="text-xs font-semibold text-foreground">
            {surahName} — Verse {verseNum}
          </span>
        </div>
        <button
          type="button"
          onClick={handleNewNote}
          className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-fast"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      {/* Quick-add input — visually prominent */}
      <div className="rounded-lg border-2 border-dashed border-border/60 bg-surface/30 transition-all focus-within:border-primary/40 focus-within:bg-surface/60">
        <textarea
          ref={quickInputRef}
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleQuickSave();
            }
          }}
          placeholder={quickPlaceholder}
          rows={2}
          className="w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
        <div className="flex items-center justify-between px-2 pb-2">
          {/* Quick prompt chips */}
          <div className="flex gap-1">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setQuickPlaceholder(p.placeholder);
                  quickInputRef.current?.focus();
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-fast",
                  "bg-muted/50 text-muted-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <p.icon className="h-3 w-3" />
                {p.label}
              </button>
            ))}
          </div>
          {quickText.trim() && (
            <button
              type="button"
              onClick={handleQuickSave}
              className="rounded-md px-3 py-1 text-[11px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-fast"
            >
              Save
            </button>
          )}
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <StickyNote className="h-5 w-5 text-muted-foreground/20" />
          <p className="text-[11px] text-muted-foreground/50">
            No notes yet — type above or use the full editor
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
