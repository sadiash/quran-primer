"use client";

import { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon, ArrowsDownUpIcon, ChatIcon, DotsThreeIcon, LinkIcon, LinkSimpleIcon, MagnifyingGlassIcon, NoteIcon, PlusIcon, PushPinIcon, PushPinSlashIcon, QuestionIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useNotes, type NoteSortOption } from "@/presentation/hooks/use-notes";
import { useToast } from "@/presentation/components/ui/toast";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { getSurahName } from "@/lib/surah-names";
import { getTagColor } from "@/lib/surah-colors";
import { cn } from "@/lib/utils";
import type { Note, LinkedResource } from "@/core/types";
import { PanelBreadcrumb } from "@/presentation/components/panels/panel-breadcrumb";

const SORT_STORAGE_KEY = "notes:sort";

function loadSort(): NoteSortOption {
  if (typeof window === "undefined") return "newest";
  try {
    return (localStorage.getItem(SORT_STORAGE_KEY) as NoteSortOption) || "newest";
  } catch {
    return "newest";
  }
}

function saveSort(sort: NoteSortOption) {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, sort);
  } catch {
    // ignore
  }
}

const SORT_OPTIONS: { value: NoteSortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "alphabetical", label: "Alphabetical" },
];

// ─── Shared search filter (matches /notes page logic) ───

function filterNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes;
  const q = query.toLowerCase();
  return notes.filter((n) => {
    const titleMatch = n.title?.toLowerCase().includes(q) ?? false;
    const contentMatch = n.content.toLowerCase().includes(q);
    const vkMatch = n.verseKeys.some((vk) => vk.includes(q));
    const surahMatch = n.surahIds.some((id) =>
      getSurahName(id).toLowerCase().includes(q),
    );
    const vkSurahMatch = n.verseKeys.some((vk) => {
      const sid = Number(vk.split(":")[0]);
      return getSurahName(sid).toLowerCase().includes(q);
    });
    const tagMatch = n.tags.some((t) => t.toLowerCase().includes(q));
    return titleMatch || contentMatch || vkMatch || surahMatch || vkSurahMatch || tagMatch;
  });
}

// ─── Shared search input ───

function NoteSearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by content, surah, verse, or tag..."
        className="w-full border-2 border-foreground/20 bg-background py-2 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-foreground focus:outline-none transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground/40 hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <XIcon weight="bold" className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Shared sort dropdown ───

function SortDropdown({ sortOption, onSort }: { sortOption: NoteSortOption; onSort: (v: NoteSortOption) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="border-2 border-transparent p-1.5 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        aria-label="Sort notes"
      >
        <ArrowsDownUpIcon weight="bold" className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 border-2 border-foreground bg-background p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onSort(opt.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
                  sortOption === opt.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── URL helper ───

function useSurahIdFromUrl(): number | null {
  const pathname = usePathname();
  const match = pathname?.match(/^\/surah\/(\d+)/);
  return match ? Number(match[1]) : null;
}

// ─── Main entry ───

export function NotesSection() {
  const { focusedVerseKey } = usePanels();
  const surahId = useSurahIdFromUrl();

  if (!focusedVerseKey) {
    return <SurahNotesView surahId={surahId} />;
  }

  return <NotesContent key={focusedVerseKey} verseKey={focusedVerseKey} />;
}

// ─── Surah-filtered view (replaces AllNotesView) ───

function SurahNotesView({ surahId }: { surahId: number | null }) {
  const notesOpts = surahId ? { forSurahReading: surahId } : undefined;
  const { notes, saveNote, removeNote, togglePin, restoreNote, sortNotes, suggestedTags } = useNotes(notesOpts);
  const { addToast } = useToast();
  const [mode, setMode] = useState<"list" | "view" | "editor">("list");
  const [sortOption, setSortOption] = useState<NoteSortOption>(loadSort);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const surahName = surahId ? getSurahName(surahId) : null;
  const headerLabel = surahName ? `${surahName} Notes` : "All Notes";

  const filteredNotes = useMemo(() => {
    const filtered = filterNotes(notes, searchQuery);
    return sortNotes(filtered, sortOption);
  }, [notes, searchQuery, sortOption, sortNotes]);

  const handleNewNote = useCallback(() => {
    setEditingNote(null);
    setMode("editor");
  }, []);

  const handleViewNote = useCallback((id: string) => {
    setEditingNote(notes.find((n) => n.id === id) ?? null);
    setMode("view");
  }, [notes]);

  const handleStartEditing = useCallback(() => {
    setMode("editor");
  }, []);

  const handleCancel = useCallback(() => {
    setMode("list");
    setEditingNote(null);
  }, []);

  const handleSave = useCallback(
    async (data: {
      title?: string;
      content: string;
      contentJson: string;
      tags: string[];
      verseKeys: string[];
      surahIds: number[];
      linkedResources?: LinkedResource[];
    }) => {
      await saveNote({
        title: data.title,
        verseKeys: data.verseKeys,
        surahIds: data.surahIds,
        content: data.content,
        contentJson: data.contentJson,
        tags: data.tags,
        linkedResources: data.linkedResources,
        id: editingNote?.id,
      });
      setMode("list");
      setEditingNote(null);
    },
    [saveNote, editingNote],
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      const noteToDelete = notes.find((n) => n.id === noteId);
      if (!noteToDelete) return;
      const backup = { ...noteToDelete };
      await removeNote(noteId);
      addToast("Note deleted", "default", {
        label: "Undo",
        onClick: () => { restoreNote(backup); },
      });
    },
    [notes, removeNote, restoreNote, addToast],
  );

  const handleToggleSurahLink = useCallback(
    async (note: Note) => {
      if (!surahId) return;
      const linked = note.surahIds.includes(surahId);
      await saveNote({
        title: note.title,
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

  const handleSortChange = useCallback((value: NoteSortOption) => {
    setSortOption(value);
    saveSort(value);
  }, []);

  // ─── View mode (read-only) ───
  if (mode === "view" && editingNote) {
    const sourceStyle = getNoteSourceStyle(editingNote);
    const viewTitle = editingNote.title || "Untitled";
    return (
      <div className="flex h-full flex-col gap-2 p-3">
        <PanelBreadcrumb items={[
          { label: headerLabel, onClick: handleCancel },
          { label: viewTitle },
        ]} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="border-2 border-transparent p-1 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            aria-label="Back to list"
          >
            <ArrowLeftIcon weight="bold" className="h-4 w-4" />
          </button>
          <span className="flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">{viewTitle}</span>
        </div>
        <div
          className="flex-1 min-h-0 overflow-y-auto border-2 border-foreground/20 bg-background p-4 space-y-3"
          style={{ borderLeft: `3px solid ${sourceStyle.borderColor}` }}
        >
          {(sourceStyle.label || editingNote.pinned) && (
            <div className="flex items-center gap-1.5">
              {sourceStyle.label && (
                <span
                  className="inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider leading-none"
                  style={{ borderColor: sourceStyle.borderColor, color: sourceStyle.borderColor }}
                >
                  {sourceStyle.label}
                </span>
              )}
              {editingNote.pinned && <PushPinIcon weight="fill" className="h-3 w-3 text-foreground/60" />}
            </div>
          )}
          {editingNote.title && (
            <h3 className="text-sm font-semibold text-foreground">{editingNote.title}</h3>
          )}
          <NoteContentRenderer content={editingNote.content} contentJson={editingNote.contentJson} />
          {editingNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {editingNote.tags.map((tag) => (
                <span key={tag} className="border border-foreground/20 bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {(editingNote.verseKeys.length > 0 || editingNote.surahIds.length > 0) && (
            <div className="font-mono text-[10px] text-muted-foreground/60">
              {editingNote.verseKeys.length > 0 && (
                <span>Verses: {editingNote.verseKeys.join(", ")}</span>
              )}
              {editingNote.verseKeys.length > 0 && editingNote.surahIds.length > 0 && <span> / </span>}
              {editingNote.surahIds.length > 0 && (
                <span>Surahs: {editingNote.surahIds.map((id) => getSurahName(id)).join(", ")}</span>
              )}
            </div>
          )}
          {editingNote.linkedResources && editingNote.linkedResources.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Linked</p>
              {editingNote.linkedResources.map((resource, idx) => (
                <div
                  key={`${resource.type}-${idx}`}
                  className="border-2 p-2 text-[11px]"
                  style={{ borderColor: resource.type === "hadith" ? "#34d39940" : "#fbbf2440" }}
                >
                  <span className="font-medium text-foreground">{resource.label}</span>
                  {resource.preview && (
                    <p className="mt-0.5 text-muted-foreground/60 line-clamp-2">{resource.preview}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartEditing}
            className="flex-1 border-2 border-foreground bg-foreground py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => togglePin(editingNote.id)}
            className="border-2 border-foreground px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            {editingNote.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            onClick={() => { handleDeleteNote(editingNote.id); handleCancel(); }}
            className="border-2 border-destructive px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-background transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  // ─── Editor mode ───
  if (mode === "editor") {
    const handleEditorBack = editingNote ? () => setMode("view") : handleCancel;
    return (
      <div className="flex h-full flex-col gap-1 p-3">
        <button
          type="button"
          onClick={handleEditorBack}
          className="flex items-center gap-1.5 self-start p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeftIcon weight="bold" className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-wider">Back</span>
        </button>
        <NoteEditor
          key={editingNote?.id ?? "new"}
          initialContent={editingNote?.contentJson ?? editingNote?.content}
          initialTitle={editingNote?.title ?? ""}
          initialTags={editingNote?.tags ?? []}
          initialVerseKeys={editingNote?.verseKeys ?? []}
          initialSurahIds={editingNote?.surahIds ?? (surahId ? [surahId] : [])}
          initialLinkedResources={editingNote?.linkedResources}
          suggestedTags={suggestedTags}
          onSave={handleSave}
          onCancel={handleEditorBack}
        />
      </div>
    );
  }

  // ─── List mode ───
  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">{headerLabel}</span>
          {notes.length > 0 && (
            <span className="border-2 border-foreground bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold text-background">
              {notes.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewNote}
            className="flex items-center gap-1 border-2 border-foreground bg-foreground px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-colors"
          >
            <PlusIcon weight="bold" className="h-3 w-3" />
            New
          </button>
          {notes.length > 1 && (
            <SortDropdown sortOption={sortOption} onSort={handleSortChange} />
          )}
        </div>
      </div>

      {/* Search — visible only with notes */}
      {notes.length > 0 && (
        <NoteSearchInput value={searchQuery} onChange={setSearchQuery} />
      )}

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-2 py-12 text-center">
          <NoteIcon weight="duotone" className="h-6 w-6 text-muted-foreground/20" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            {surahName ? `No notes for ${surahName}` : "No notes yet"}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/30 max-w-[200px]">
            Use the + New button above to start writing
          </p>
        </div>
      )}

      {/* Notes list */}
      {notes.length > 0 && filteredNotes.length > 0 && (
        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              surahId={surahId ?? (note.surahIds[0] ?? 0)}
              surahName={surahName ?? (note.surahIds[0] ? getSurahName(note.surahIds[0]) : "")}
              onView={handleViewNote}
              onDelete={handleDeleteNote}
              onTogglePin={togglePin}
              onToggleSurahLink={handleToggleSurahLink}
            />
          ))}
        </div>
      )}

      {/* No search results */}
      {notes.length > 0 && filteredNotes.length === 0 && searchQuery.trim() && (
        <p className="py-6 text-center font-mono text-[10px] text-muted-foreground/50">
          No notes match &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
}

// ─── Inner component — remounts on verse change (React Compiler safe) ───

interface NotesContentProps {
  verseKey: string;
}

const QUICK_PROMPTS = [
  {
    icon: ChatIcon,
    label: "Reflection",
    getTemplate: (vk: string) => ({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: `Reflection on ${vk}` }] },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: "What stands out to me:" }] },
        { type: "paragraph" },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: "How this applies to my life:" }] },
        { type: "paragraph" },
      ],
    }),
    tag: "reflection",
  },
  {
    icon: QuestionIcon,
    label: "Question",
    getTemplate: (vk: string) => ({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: `Question about ${vk}` }] },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: "My question:" }] },
        { type: "paragraph" },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: "Possible answer/context:" }] },
        { type: "paragraph" },
      ],
    }),
    tag: "question",
  },
  {
    icon: LinkIcon,
    label: "Connection",
    getTemplate: (vk: string) => ({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: `Connection from ${vk}` }] },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: "This reminds me of:" }] },
        { type: "paragraph" },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: "The connection I see:" }] },
        { type: "paragraph" },
      ],
    }),
    tag: "connection",
  },
];

function NotesContent({ verseKey }: NotesContentProps) {
  const [, verseNum] = verseKey.split(":");
  const surahId = Number(verseKey.split(":")[0]);
  const surahName = getSurahName(surahId);

  const { notes, saveNote, removeNote, togglePin, restoreNote, sortNotes, suggestedTags } = useNotes({
    forSurahReading: surahId,
  });
  const { addToast } = useToast();
  const [mode, setMode] = useState<"list" | "view" | "editor">("list");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sortOption, setSortOption] = useState<NoteSortOption>(loadSort);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateContent, setTemplateContent] = useState<string | undefined>(undefined);
  const [templateTag, setTemplateTag] = useState<string | undefined>(undefined);

  const { verseNotes, otherNotes } = useMemo(() => {
    const filtered = filterNotes(notes, searchQuery);
    const verse: Note[] = [];
    const other: Note[] = [];
    for (const n of filtered) {
      if (n.verseKeys.includes(verseKey)) verse.push(n);
      else other.push(n);
    }

    // This-verse notes: pinned first, then user's sort preference
    const sortedVerse = sortNotes(verse, sortOption);

    // Other surah notes: pinned first, then by verse number ascending
    const surahPrefix = verseKey.split(":")[0] + ":";
    const getMinVerse = (n: Note): number => {
      const nums = n.verseKeys
        .filter((vk) => vk.startsWith(surahPrefix))
        .map((vk) => Number(vk.split(":")[1]));
      return nums.length > 0 ? Math.min(...nums) : Infinity;
    };
    other.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return getMinVerse(a) - getMinVerse(b);
    });

    return { verseNotes: sortedVerse, otherNotes: other };
  }, [notes, searchQuery, sortOption, sortNotes, verseKey]);

  const handleNewNote = useCallback(() => {
    setEditingNote(null);
    setTemplateContent(undefined);
    setTemplateTag(undefined);
    setMode("editor");
  }, []);

  const handleViewNote = useCallback((id: string) => {
    setEditingNote(notes.find((n) => n.id === id) ?? null);
    setTemplateContent(undefined);
    setTemplateTag(undefined);
    setMode("view");
  }, [notes]);

  const handleStartEditing = useCallback(() => {
    setMode("editor");
  }, []);

  const handleCancel = useCallback(() => {
    setMode("list");
    setEditingNote(null);
    setTemplateContent(undefined);
    setTemplateTag(undefined);
  }, []);

  const handleSave = useCallback(
    async (data: {
      title?: string;
      content: string;
      contentJson: string;
      tags: string[];
      verseKeys: string[];
      surahIds: number[];
      linkedResources?: LinkedResource[];
    }) => {
      await saveNote({
        title: data.title,
        verseKeys: data.verseKeys,
        surahIds: data.surahIds,
        content: data.content,
        contentJson: data.contentJson,
        tags: data.tags,
        linkedResources: data.linkedResources,
        id: editingNote?.id,
      });
      setMode("list");
      setEditingNote(null);
      setTemplateContent(undefined);
      setTemplateTag(undefined);
    },
    [saveNote, editingNote],
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      const noteToDelete = notes.find((n) => n.id === noteId);
      if (!noteToDelete) return;
      const backup = { ...noteToDelete };
      await removeNote(noteId);
      addToast("Note deleted", "default", {
        label: "Undo",
        onClick: () => {
          restoreNote(backup);
        },
      });
    },
    [notes, removeNote, restoreNote, addToast],
  );

  const handleToggleSurahLink = useCallback(
    async (note: Note) => {
      const linked = note.surahIds.includes(surahId);
      await saveNote({
        title: note.title,
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

  const handleToggleVerseLink = useCallback(
    async (note: Note) => {
      const linked = note.verseKeys.includes(verseKey);
      await saveNote({
        title: note.title,
        verseKeys: linked
          ? note.verseKeys.filter((vk) => vk !== verseKey)
          : [...note.verseKeys, verseKey],
        surahIds: note.surahIds,
        content: note.content,
        contentJson: note.contentJson,
        tags: note.tags,
        id: note.id,
      });
    },
    [verseKey, saveNote],
  );

  const handleSortChange = useCallback((value: NoteSortOption) => {
    setSortOption(value);
    saveSort(value);
  }, []);

  const handlePromptClick = useCallback(
    (prompt: (typeof QUICK_PROMPTS)[number]) => {
      const template = prompt.getTemplate(verseKey);
      setTemplateContent(JSON.stringify(template));
      setTemplateTag(prompt.tag);
      setEditingNote(null);
      setMode("editor");
    },
    [verseKey],
  );

  // ─── View mode (read-only) ───
  if (mode === "view" && editingNote) {
    const sourceStyle = getNoteSourceStyle(editingNote);
    const viewTitle = editingNote.title || "Untitled";
    return (
      <div className="flex h-full flex-col gap-2 p-3">
        <PanelBreadcrumb items={[
          { label: "Notes", onClick: handleCancel },
          { label: viewTitle },
        ]} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="border-2 border-transparent p-1 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            aria-label="Back to list"
          >
            <ArrowLeftIcon weight="bold" className="h-4 w-4" />
          </button>
          <span className="flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">{viewTitle}</span>
        </div>
        <div
          className="flex-1 min-h-0 overflow-y-auto border-2 border-foreground/20 bg-background p-4 space-y-3"
          style={{ borderLeft: `3px solid ${sourceStyle.borderColor}` }}
        >
          {(sourceStyle.label || editingNote.pinned) && (
            <div className="flex items-center gap-1.5">
              {sourceStyle.label && (
                <span
                  className="inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider leading-none"
                  style={{ borderColor: sourceStyle.borderColor, color: sourceStyle.borderColor }}
                >
                  {sourceStyle.label}
                </span>
              )}
              {editingNote.pinned && <PushPinIcon weight="fill" className="h-3 w-3 text-foreground/60" />}
            </div>
          )}
          {editingNote.title && (
            <h3 className="text-sm font-semibold text-foreground">{editingNote.title}</h3>
          )}
          <NoteContentRenderer content={editingNote.content} contentJson={editingNote.contentJson} />
          {editingNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {editingNote.tags.map((tag) => (
                <span key={tag} className="border border-foreground/20 bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {(editingNote.verseKeys.length > 0 || editingNote.surahIds.length > 0) && (
            <div className="font-mono text-[10px] text-muted-foreground/60">
              {editingNote.verseKeys.length > 0 && (
                <span>Verses: {editingNote.verseKeys.join(", ")}</span>
              )}
              {editingNote.verseKeys.length > 0 && editingNote.surahIds.length > 0 && <span> / </span>}
              {editingNote.surahIds.length > 0 && (
                <span>Surahs: {editingNote.surahIds.map((id) => getSurahName(id)).join(", ")}</span>
              )}
            </div>
          )}
          {editingNote.linkedResources && editingNote.linkedResources.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Linked</p>
              {editingNote.linkedResources.map((resource, idx) => (
                <div
                  key={`${resource.type}-${idx}`}
                  className="border-2 p-2 text-[11px]"
                  style={{ borderColor: resource.type === "hadith" ? "#34d39940" : "#fbbf2440" }}
                >
                  <span className="font-medium text-foreground">{resource.label}</span>
                  {resource.preview && (
                    <p className="mt-0.5 text-muted-foreground/60 line-clamp-2">{resource.preview}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartEditing}
            className="flex-1 border-2 border-foreground bg-foreground py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => togglePin(editingNote.id)}
            className="border-2 border-foreground px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            {editingNote.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            onClick={() => { handleDeleteNote(editingNote.id); handleCancel(); }}
            className="border-2 border-destructive px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-background transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  // ─── Editor mode ───
  if (mode === "editor") {
    const handleEditorBack = editingNote ? () => setMode("view") : handleCancel;
    return (
      <div className="flex h-full flex-col gap-1 p-3">
        <button
          type="button"
          onClick={handleEditorBack}
          className="flex items-center gap-1.5 self-start p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeftIcon weight="bold" className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-wider">Back</span>
        </button>
        <NoteEditor
          key={editingNote?.id ?? templateContent ?? "new"}
          initialContent={
            editingNote?.contentJson ?? editingNote?.content ?? templateContent
          }
          initialTitle={editingNote?.title ?? ""}
          initialTags={
            editingNote?.tags ?? (templateTag ? [templateTag] : [])
          }
          initialVerseKeys={editingNote?.verseKeys ?? [verseKey]}
          initialSurahIds={editingNote?.surahIds ?? []}
          initialLinkedResources={editingNote?.linkedResources}
          suggestedTags={suggestedTags}
          onSave={handleSave}
          onCancel={handleEditorBack}
        />
      </div>
    );
  }

  // ─── List mode ───
  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
            {surahName} -- Verse {verseNum}
          </span>
          {notes.length > 0 && (
            <span className="border-2 border-foreground bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold text-background">
              {notes.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notes.length > 1 && (
            <SortDropdown sortOption={sortOption} onSort={handleSortChange} />
          )}
        </div>
      </div>

      {/* Search — visible only with notes */}
      {notes.length > 0 && (
        <NoteSearchInput value={searchQuery} onChange={setSearchQuery} />
      )}

      {/* Quick create — compact inline row */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleNewNote}
          className="flex items-center gap-1 px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border hover:border-foreground hover:text-foreground transition-colors"
        >
          <PlusIcon weight="bold" className="h-3 w-3" />
          Blank
        </button>
        {QUICK_PROMPTS.map((p) => {
          const color = getTagColor(p.tag);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePromptClick(p)}
              className="flex items-center gap-1 px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:opacity-70"
              style={{ color: color.label, borderBottom: `2px solid ${color.accent}` }}
            >
              <p.icon weight="bold" className="h-3 w-3" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Notes for this verse */}
      {verseNotes.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
            This verse
          </p>
          {verseNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              surahId={surahId}
              surahName={surahName}
              onView={handleViewNote}
              onDelete={handleDeleteNote}
              onTogglePin={togglePin}
              onToggleSurahLink={handleToggleSurahLink}
              verseKey={verseKey}
              onToggleVerseLink={handleToggleVerseLink}
            />
          ))}
        </div>
      )}

      {/* Other surah notes */}
      {otherNotes.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Other {surahName} notes
          </p>
          {otherNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              surahId={surahId}
              surahName={surahName}
              onView={handleViewNote}
              onDelete={handleDeleteNote}
              onTogglePin={togglePin}
              onToggleSurahLink={handleToggleSurahLink}
              verseKey={verseKey}
              onToggleVerseLink={handleToggleVerseLink}
            />
          ))}
        </div>
      )}

      {/* No search results */}
      {notes.length > 0 && verseNotes.length === 0 && otherNotes.length === 0 && searchQuery.trim() && (
        <p className="py-6 text-center font-mono text-[10px] text-muted-foreground/50">
          No notes match &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
}

// ─── Note card in list ───

interface NoteCardProps {
  note: Note;
  surahId: number;
  surahName: string;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleSurahLink: (note: Note) => void;
  /** When provided, shows "Link/Unlink verse" in the menu instead of surah link */
  verseKey?: string;
  onToggleVerseLink?: (note: Note) => void;
}

/** Color-code note cards by first tag — uses shared getTagColor for consistency */
function getNoteSourceStyle(note: Note) {
  const tag = note.tags[0];
  if (!tag) return { borderColor: "#64748b", dotColor: "", bgColor: "", label: "" };
  const color = getTagColor(tag);
  return { borderColor: color.accent, dotColor: color.accent, bgColor: color.bg, label: tag };
}

function NoteCard({ note, surahId, surahName, onView, onDelete, onTogglePin, onToggleSurahLink, verseKey, onToggleVerseLink }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isLinkedToSurah = note.surahIds.includes(surahId);
  const hasRealTitle = !!note.title;
  const sourceStyle = getNoteSourceStyle(note);

  // For untitled notes, use first line of content as pseudo-title
  const firstLine = note.content.split("\n")[0]?.trim() || "Untitled";
  const displayTitle = note.title || (firstLine.length > 60 ? firstLine.slice(0, 60) + "..." : firstLine);

  // Build clean metadata items joined by middots
  const metaItems: string[] = [];
  if (note.verseKeys.length > 0) {
    metaItems.push(note.verseKeys.slice(0, 2).join(", ") + (note.verseKeys.length > 2 ? ` +${note.verseKeys.length - 2}` : ""));
  }
  if (note.tags.length > 0) {
    metaItems.push(note.tags.slice(0, 2).join(", ") + (note.tags.length > 2 ? ` +${note.tags.length - 2}` : ""));
  }
  if (note.linkedResources && note.linkedResources.length > 0) {
    metaItems.push(`${note.linkedResources.length} linked`);
  }
  metaItems.push(note.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(note.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(note.id); } }}
      className={cn(
        "relative cursor-pointer border-2 border-foreground/20 p-3 transition-colors hover:border-foreground",
        note.pinned && "border-foreground",
      )}
      style={{ borderLeft: `3px solid ${sourceStyle.borderColor}`, backgroundColor: sourceStyle.bgColor || undefined }}
    >
      {/* Header: type badge + pin + menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {sourceStyle.label && (
            <span
              className="inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider leading-none"
              style={{ borderColor: sourceStyle.borderColor, color: sourceStyle.borderColor }}
            >
              {sourceStyle.label}
            </span>
          )}
          {note.pinned && <PushPinIcon weight="fill" className="h-3 w-3 shrink-0 text-foreground/60" />}
        </div>
        {/* Menu — stops click from propagating to card */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setShowMenu(!showMenu)} className="border-2 border-transparent p-1 text-muted-foreground/60 hover:border-foreground hover:text-foreground transition-colors" aria-label="Note actions">
            <DotsThreeIcon weight="bold" className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 border-2 border-foreground bg-background p-1">
                <button type="button" onClick={() => { setShowMenu(false); onTogglePin(note.id); }} className="flex w-full items-center gap-2 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground hover:bg-foreground hover:text-background transition-colors">{note.pinned ? <><PushPinSlashIcon weight="bold" className="h-3 w-3" />Unpin</> : <><PushPinIcon weight="fill" className="h-3 w-3" />Pin</>}</button>
                {verseKey && onToggleVerseLink ? (
                  <button type="button" onClick={() => { setShowMenu(false); onToggleVerseLink(note); }} className="flex w-full items-center gap-2 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground hover:bg-foreground hover:text-background transition-colors"><LinkSimpleIcon weight="bold" className="h-3 w-3" />{note.verseKeys.includes(verseKey) ? `Unlink ${verseKey}` : `LinkIcon to ${verseKey}`}</button>
                ) : (
                  <button type="button" onClick={() => { setShowMenu(false); onToggleSurahLink(note); }} className="flex w-full items-center gap-2 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground hover:bg-foreground hover:text-background transition-colors"><LinkSimpleIcon weight="bold" className="h-3 w-3" />{isLinkedToSurah ? "Unlink surah" : "Link surah"}</button>
                )}
                <button type="button" onClick={() => { setShowMenu(false); onDelete(note.id); }} className="flex w-full items-center gap-2 px-2.5 py-1.5 font-mono text-[10px] text-destructive hover:bg-destructive hover:text-background transition-colors"><TrashIcon weight="bold" className="h-3 w-3" />Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mt-1.5">
        <span className={cn("text-xs leading-snug", hasRealTitle ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>{displayTitle}</span>
      </div>

      {/* Content preview — always shown for titled notes, untitled use content as title already */}
      {hasRealTitle && (
        <div className="mt-1">
          <NoteContentRenderer content={note.content} contentJson={note.contentJson} className="line-clamp-2 text-[11px] text-muted-foreground/60" />
        </div>
      )}

      {/* Metadata */}
      <div className="mt-2 font-mono text-[10px] text-muted-foreground/50">
        {metaItems.join(" / ")}
      </div>
    </div>
  );
}
