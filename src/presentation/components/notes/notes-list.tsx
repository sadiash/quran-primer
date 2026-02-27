"use client";

import Link from "next/link";
import { DotsThreeIcon, LightbulbIcon, MapPinIcon, PencilSimpleIcon, PushPinIcon, PushPinSlashIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";
import { useNotes } from "@/presentation/hooks/use-notes";
import { useToast } from "@/presentation/components/ui/toast";
import { noteLocationLabel } from "@/core/types/study";
import { getSurahName } from "@/lib/surah-names";
import { getSurahColor } from "@/lib/surah-colors";
import { cn } from "@/lib/utils";
import { useState, useCallback, useMemo } from "react";
import type { Note } from "@/core/types";

export function NotesList() {
  const { notes, removeNote, togglePin, restoreNote, sortNotes } = useNotes();
  const { addToast } = useToast();

  const sortedNotes = useMemo(
    () => sortNotes(notes, "newest"),
    [notes, sortNotes],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const noteToDelete = notes.find((n) => n.id === id);
      if (!noteToDelete) return;
      const backup = { ...noteToDelete };
      await removeNote(id);
      addToast("Note deleted", "default", {
        label: "Undo",
        onClick: () => {
          restoreNote(backup);
        },
      });
    },
    [notes, removeNote, restoreNote, addToast],
  );

  if (sortedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="p-3" style={{ backgroundColor: '#fefce8' }}>
          <LightbulbIcon weight="duotone" className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-muted-foreground/70">
          No notes yet
        </p>
        <p className="text-xs text-muted-foreground/50 max-w-[240px]">
          Create notes while studying to build your personal knowledge base
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedNotes.map((note) => {
        const firstVk = note.verseKeys[0];
        const surahId = firstVk
          ? Number(firstVk.split(":")[0])
          : note.surahIds[0];
        const href = surahId ? `/surah/${surahId}` : "/notes";
        return (
          <NotesListCard
            key={note.id}
            note={note}
            href={href}
            onTogglePin={togglePin}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}

// ─── Card with title, overflow menu, compact metadata ───

interface NotesListCardProps {
  note: Note;
  href: string;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotesListCard({ note, href, onTogglePin, onDelete }: NotesListCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const displayTitle = note.title || note.content.slice(0, 50) + (note.content.length > 50 ? "..." : "");
  const hasRealTitle = !!note.title;
  const location = noteLocationLabel(note, getSurahName);

  const firstVk = note.verseKeys[0];
  const noteSurahId = firstVk ? Number(firstVk.split(":")[0]) : note.surahIds[0];
  const noteColor = noteSurahId ? getSurahColor(noteSurahId) : null;

  return (
    <div
      className={cn(
        "relative border border-border bg-background p-3",
        "transition-colors hover:bg-[#fafafa]",
        note.pinned && "bg-[#fefce8]/30",
      )}
      style={noteColor ? { borderLeft: `3px solid ${noteColor.accent}` } : undefined}
    >
      {/* Title row with pin + overflow */}
      <div className="flex items-start gap-2">
        <Link href={href} className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {note.pinned && <PushPinIcon weight="fill" className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
            <span className={cn("text-sm leading-snug", hasRealTitle ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
              {displayTitle}
            </span>
          </div>
          {hasRealTitle && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{note.content}</p>
          )}
        </Link>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-muted-foreground/60 hover:bg-[#fafafa] hover:text-foreground transition-colors"
            aria-label="Note actions"
          >
            <DotsThreeIcon weight="bold" className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 border border-border bg-background p-1 shadow-md">
                <button type="button" onClick={() => { setShowMenu(false); onTogglePin(note.id); }} className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors">
                  {note.pinned ? <><PushPinSlashIcon weight="bold" className="h-3 w-3" />Unpin</> : <><PushPinIcon weight="fill" className="h-3 w-3" />Pin</>}
                </button>
                <button type="button" onClick={() => { setShowMenu(false); onDelete(note.id); }} className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors">
                  <TrashIcon weight="bold" className="h-3 w-3" />Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Compact metadata row */}
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <MapPinIcon weight="bold" className="h-2.5 w-2.5" />
        <span>{location}</span>
        {note.tags.length > 0 && (
          <>
            <span className="text-muted-foreground/30">&middot;</span>
            <TagIcon weight="bold" className="h-2.5 w-2.5" />
            <span>{note.tags.length === 1 ? note.tags[0] : `${note.tags[0]} +${note.tags.length - 1}`}</span>
          </>
        )}
        <span className="text-muted-foreground/30">&middot;</span>
        <span>{note.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}
