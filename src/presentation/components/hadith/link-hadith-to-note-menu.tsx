"use client";

import { useState, useMemo, useCallback } from "react";
import { LinkSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useNotes } from "@/presentation/hooks/use-notes";
import { noteLocationLabel } from "@/core/types/study";
import { getSurahName } from "@/lib/surah-names";
import type { LinkedResource } from "@/core/types/study";

interface LinkHadithToNoteMenuProps {
  resource: LinkedResource;
  onLinked: () => void;
}

export function LinkHadithToNoteMenu({ resource, onLinked }: LinkHadithToNoteMenuProps) {
  const { notes, addResourceToNote } = useNotes();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = notes.slice(0, 20);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          (n.title ?? "").toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          noteLocationLabel(n, getSurahName).toLowerCase().includes(q),
      );
    }
    return result.slice(0, 10);
  }, [notes, search]);

  const handleLink = useCallback(
    async (noteId: string) => {
      await addResourceToNote(noteId, resource);
      onLinked();
    },
    [addResourceToNote, resource, onLinked],
  );

  if (notes.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
        No notes to link to. Create a note first.
      </div>
    );
  }

  return (
    <div className="w-64">
      <div className="relative border-b border-border px-2 py-1.5">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="MagnifyingGlassIcon notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent py-1 pl-6 pr-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
          autoFocus
        />
      </div>
      <div className="max-h-[240px] overflow-y-auto p-1">
        {filtered.map((note) => {
          const alreadyLinked = note.linkedResources?.some(
            (r) => r.type === resource.type && r.label === resource.label,
          );
          return (
            <button
              key={note.id}
              type="button"
              disabled={!!alreadyLinked}
              onClick={() => handleLink(note.id)}
              className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-fast hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LinkSimpleIcon className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {note.title || noteLocationLabel(note, getSurahName)}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground">
                  {note.content}
                </p>
                {alreadyLinked && (
                  <p className="mt-0.5 text-[10px] text-primary">
                    Already linked
                  </p>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && search && (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No matching notes
          </p>
        )}
      </div>
    </div>
  );
}
