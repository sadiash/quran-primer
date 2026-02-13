"use client";

import { useState, useRef } from "react";
import { StickyNote, Plus, Trash2, Tag, Save, X } from "lucide-react";
import { useWorkspace } from "@/presentation/providers";
import { useNotes } from "@/presentation/hooks/use-notes";
import type { Note } from "@/core/types";

export function NotesPanel() {
  const { state } = useWorkspace();
  const verseKey = state.focusedVerseKey;
  const surahId = verseKey ? Number(verseKey.split(":")[0]) : undefined;
  const { notes, saveNote, removeNote } = useNotes({ verseKey: verseKey ?? undefined });
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  if (!verseKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
        <StickyNote className="h-8 w-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No verse selected</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Select a verse to view or add notes
          </p>
        </div>
      </div>
    );
  }

  const startNewNote = () => {
    setEditingNote(null);
    setIsEditing(true);
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSave = async (content: string, tags: string[]) => {
    if (!verseKey || !surahId) return;
    await saveNote({
      verseKey,
      surahId,
      content,
      tags,
      id: editingNote?.id,
    });
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleDelete = async (id: string) => {
    await removeNote(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Verse <span className="font-mono text-foreground">{verseKey}</span>
        </p>
        {!isEditing && (
          <button
            onClick={startNewNote}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary transition-fast hover:bg-primary/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Add note
          </button>
        )}
      </div>

      {isEditing && (
        <NoteEditor
          initialNote={editingNote}
          onSave={handleSave}
          onCancel={() => { setIsEditing(false); setEditingNote(null); }}
        />
      )}

      {/* Notes list */}
      {notes.length === 0 && !isEditing && (
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground/70 italic">
            No notes for this verse yet.
          </p>
          <button
            onClick={startNewNote}
            className="mt-2 text-xs text-primary transition-fast hover:underline"
          >
            Create your first note
          </button>
        </div>
      )}

      {notes.map((note) => (
        <div
          key={note.id}
          className="group rounded-lg border border-border/50 bg-surface/50 p-3 transition-fast hover:border-border"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="flex-1 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-fast">
              <button
                onClick={() => startEditNote(note)}
                className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
                aria-label="Edit note"
              >
                <StickyNote className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-fast"
                aria-label="Delete note"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 text-[10px] text-muted-foreground/60">
            {note.updatedAt.toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function NoteEditor({
  initialNote,
  onSave,
  onCancel,
}: {
  initialNote: Note | null;
  onSave: (content: string, tags: string[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(initialNote?.content ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialNote?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await onSave(content, tags);
    setSaving(false);
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-surface p-3 space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        className="w-full resize-none rounded-md border-0 bg-transparent p-0 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        rows={4}
        autoFocus
      />

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
          >
            {tag}
            <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 hover:text-destructive">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="Add tag..."
          className="min-w-[60px] flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 pt-1">
        <button
          onClick={onCancel}
          className="rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-fast hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-fast hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
