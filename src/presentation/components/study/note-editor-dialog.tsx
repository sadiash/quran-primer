"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import { Textarea, Badge, Button, Input } from "@/presentation/components/ui";
import { useNotes } from "@/presentation/hooks/use-notes";
import { useToast } from "@/presentation/components/ui/toast";
import { getSurahName } from "@/lib/surah-names";
import type { Note } from "@/core/types";

interface NoteEditorDialogProps {
  open: boolean;
  onClose: () => void;
  verseKey: string;
  surahId: number;
  existingNote?: Note;
}

export function NoteEditorDialog({
  open,
  onClose,
  verseKey,
  surahId,
  existingNote,
}: NoteEditorDialogProps) {
  const { saveNote, removeNote } = useNotes();
  const { toast } = useToast();
  const [content, setContent] = useState(existingNote?.content ?? "");
  const [tags, setTags] = useState<string[]>(existingNote?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const [, verseNum] = verseKey.split(":");
  const surahName = getSurahName(surahId);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }, [tagInput, tags]);

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    await saveNote({
      verseKey,
      surahId,
      content: content.trim(),
      tags,
      id: existingNote?.id,
    });
    toast(existingNote ? "Note updated" : "Note saved");
    onClose();
  };

  const handleDelete = async () => {
    if (!existingNote) return;
    await removeNote(existingNote.id);
    toast("Note deleted");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          {existingNote ? "Edit Note" : "Add Note"}
        </DialogTitle>
        <DialogDescription>
          {surahName} — Verse {verseNum}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          aria-label="Note content"
        />

        <div>
          <Input
            placeholder="Add tag (Enter or comma)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            aria-label="Tag input"
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove tag ${tag}`}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        {existingNote && (
          <Button variant="ghost" onClick={handleDelete}>
            Delete
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!content.trim()}>
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
