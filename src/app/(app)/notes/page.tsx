"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StickyNote, Search, Trash2, Tag } from "lucide-react";
import { useNotes } from "@/presentation/hooks/use-notes";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const { notes, removeNote } = useNotes();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

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
        const name = getSurahName(n.surahId).toLowerCase();
        return (
          n.content.toLowerCase().includes(q) ||
          name.includes(q) ||
          n.verseKey.includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    return result;
  }, [notes, search, tagFilter]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader
        title="Notes"
        subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""}`}
        icon={StickyNote}
      />

      {notes.length > 0 && (
        <>
          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes by content, surah, or tag..."
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
          const [surahNum, verseNum] = note.verseKey.split(":");
          return (
            <div
              key={note.id}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft-sm"
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/surah/${surahNum}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-fast"
                  >
                    {getSurahName(Number(surahNum))} — Verse {verseNum}
                  </Link>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80 line-clamp-4">
                    {note.content}
                  </p>
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
                  onClick={() => removeNote(note.id)}
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

      {notes.length === 0 && (
        <div className="mt-16 text-center">
          <StickyNote className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            No notes yet. Add notes to verses while reading to see them here.
          </p>
          <Link
            href="/surah/1"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
          >
            Start reading
          </Link>
        </div>
      )}

      {notes.length > 0 && filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No notes match your search.
        </p>
      )}
    </div>
  );
}
