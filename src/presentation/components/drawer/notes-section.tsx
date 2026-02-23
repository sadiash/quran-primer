"use client";

import { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  Trash2,
  Tag,
  BookText,
  Link2,
  MessageSquare,
  HelpCircle,
  Link,
  Pin,
  PinOff,
  ArrowUpDown,
  MoreHorizontal,
  MapPin,
  StickyNote,
  Search,
  X,
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useNotes, type NoteSortOption } from "@/presentation/hooks/use-notes";
import { useToast } from "@/presentation/components/ui/toast";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { getSurahName } from "@/lib/surah-names";
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
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by content, surah, verse, or tag..."
        className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none transition-fast"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground/40 hover:text-foreground transition-fast"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
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
        className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
        aria-label="Sort notes"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onSort(opt.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center rounded-md px-2.5 py-1.5 text-xs transition-fast",
                  sortOption === opt.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
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
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [sortOption, setSortOption] = useState<NoteSortOption>(loadSort);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const surahName = surahId ? getSurahName(surahId) : null;
  const headerLabel = surahName ? `${surahName} Notes` : "All Notes";

  const editingNote = editingNoteId
    ? notes.find((n) => n.id === editingNoteId) ?? null
    : null;

  const filteredNotes = useMemo(() => {
    const filtered = filterNotes(notes, searchQuery);
    return sortNotes(filtered, sortOption);
  }, [notes, searchQuery, sortOption, sortNotes]);

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
        id: editingNoteId ?? undefined,
      });
      setMode("list");
      setEditingNoteId(null);
    },
    [saveNote, editingNoteId],
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

  // ─── Editor mode ───
  if (mode === "editor") {
    const editorTitle = editingNote ? (editingNote.title || "Untitled") : "New Note";
    return (
      <div className="flex flex-col gap-2 p-3">
        <PanelBreadcrumb items={[
          { label: headerLabel, onClick: handleCancel },
          { label: editorTitle },
        ]} />
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
          initialTitle={editingNote?.title ?? ""}
          initialTags={editingNote?.tags ?? []}
          initialVerseKeys={editingNote?.verseKeys ?? []}
          initialSurahIds={editingNote?.surahIds ?? (surahId ? [surahId] : [])}
          initialLinkedResources={editingNote?.linkedResources}
          suggestedTags={suggestedTags}
          onSave={handleSave}
          onCancel={handleCancel}
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
          <span className="text-xs font-semibold text-foreground">{headerLabel}</span>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {notes.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewNote}
            className="rounded-md p-1.5 text-primary hover:bg-primary/10 transition-fast"
            aria-label="New note"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          {notes.length > 1 && (
            <SortDropdown sortOption={sortOption} onSort={handleSortChange} />
          )}
        </div>
      </div>

      {/* Search — always visible */}
      <NoteSearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <div className="rounded-full bg-primary/5 p-3">
            <StickyNote className="h-6 w-6 text-primary/30" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground/70">
              {surahName ? `No notes for ${surahName}` : "No notes yet"}
            </p>
            <p className="text-[11px] text-muted-foreground/50 max-w-[200px]">
              {surahName
                ? "Start capturing your reflections for this surah"
                : "Click on any verse while reading to add your first note"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewNote}
            className="mt-1 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Write a note
          </button>
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
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onTogglePin={togglePin}
              onToggleSurahLink={handleToggleSurahLink}
            />
          ))}
        </div>
      )}

      {/* No search results */}
      {notes.length > 0 && filteredNotes.length === 0 && searchQuery.trim() && (
        <p className="py-6 text-center text-[11px] text-muted-foreground/50">
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
    icon: MessageSquare,
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
    icon: HelpCircle,
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
    icon: Link,
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
    verseKey,
  });
  const { addToast } = useToast();
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<NoteSortOption>(loadSort);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateContent, setTemplateContent] = useState<string | undefined>(undefined);
  const [templateTag, setTemplateTag] = useState<string | undefined>(undefined);

  const editingNote = editingNoteId
    ? notes.find((n) => n.id === editingNoteId) ?? null
    : null;

  const filteredNotes = useMemo(() => {
    const filtered = filterNotes(notes, searchQuery);
    return sortNotes(filtered, sortOption);
  }, [notes, searchQuery, sortOption, sortNotes]);

  const handleNewNote = useCallback(() => {
    setEditingNoteId(null);
    setTemplateContent(undefined);
    setTemplateTag(undefined);
    setMode("editor");
  }, []);

  const handleEditNote = useCallback((id: string) => {
    setEditingNoteId(id);
    setTemplateContent(undefined);
    setTemplateTag(undefined);
    setMode("editor");
  }, []);

  const handleCancel = useCallback(() => {
    setMode("list");
    setEditingNoteId(null);
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
        id: editingNoteId ?? undefined,
      });
      setMode("list");
      setEditingNoteId(null);
      setTemplateContent(undefined);
      setTemplateTag(undefined);
    },
    [saveNote, editingNoteId],
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

  const handleSortChange = useCallback((value: NoteSortOption) => {
    setSortOption(value);
    saveSort(value);
  }, []);

  const handlePromptClick = useCallback(
    (prompt: (typeof QUICK_PROMPTS)[number]) => {
      const template = prompt.getTemplate(verseKey);
      setTemplateContent(JSON.stringify(template));
      setTemplateTag(prompt.tag);
      setEditingNoteId(null);
      setMode("editor");
    },
    [verseKey],
  );

  // ─── Editor mode ───
  if (mode === "editor") {
    const editorTitle = editingNote
      ? (editingNote.title || "Untitled")
      : "New Note";
    return (
      <div className="flex flex-col gap-2 p-3">
        <PanelBreadcrumb items={[
          { label: "Notes", onClick: handleCancel },
          { label: editorTitle },
        ]} />
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
          key={editingNoteId ?? templateContent ?? "new"}
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
          onCancel={handleCancel}
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
          <span className="text-xs font-semibold text-foreground">
            {surahName} — Verse {verseNum}
          </span>
          {notes.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
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

      {/* Search — always visible */}
      <NoteSearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Create note — single clear button */}
      <button
        type="button"
        onClick={handleNewNote}
        className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Plus className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Write a note</p>
          <p className="text-[10px] text-muted-foreground/60">Add title, tags, and link to passages</p>
        </div>
      </button>

      {/* Template prompts — clear action cards */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePromptClick(p)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <p.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Notes list */}
      {filteredNotes.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Your notes
          </p>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              surahId={surahId}
              surahName={surahName}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onTogglePin={togglePin}
              onToggleSurahLink={handleToggleSurahLink}
            />
          ))}
        </div>
      )}

      {/* No search results */}
      {notes.length > 0 && filteredNotes.length === 0 && searchQuery.trim() && (
        <p className="py-6 text-center text-[11px] text-muted-foreground/50">
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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleSurahLink: (note: Note) => void;
}

/** Color-code note cards by source/type */
function getNoteSourceStyle(note: Note) {
  const resources = note.linkedResources;
  const hasHadith = resources?.some((r) => r.type === "hadith");
  const hasTafsir = resources?.some((r) => r.type === "tafsir");
  if (hasHadith && hasTafsir) return { borderColor: "#a78bfa", dotColor: "#a78bfa", bg: "bg-violet-500/5", label: "Hadith + Tafsir" };
  if (hasHadith) return { borderColor: "#34d399", dotColor: "#34d399", bg: "bg-emerald-500/5", label: "Hadith" };
  if (hasTafsir) return { borderColor: "#fbbf24", dotColor: "#fbbf24", bg: "bg-amber-500/5", label: "Tafsir" };

  const tags = note.tags;
  if (tags.includes("reflection")) return { borderColor: "#60a5fa", dotColor: "#60a5fa", bg: "bg-blue-500/5", label: "Reflection" };
  if (tags.includes("question")) return { borderColor: "#c084fc", dotColor: "#c084fc", bg: "bg-purple-500/5", label: "Question" };
  if (tags.includes("connection")) return { borderColor: "#2dd4bf", dotColor: "#2dd4bf", bg: "bg-teal-500/5", label: "Connection" };

  return { borderColor: "#64748b", dotColor: "", bg: "bg-card", label: "" };
}

function NoteCard({ note, surahId, surahName, onEdit, onDelete, onTogglePin, onToggleSurahLink }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isLinkedToSurah = note.surahIds.includes(surahId);
  const displayTitle = note.title || note.content.slice(0, 50) + (note.content.length > 50 ? "..." : "");
  const hasRealTitle = !!note.title;
  const sourceStyle = getNoteSourceStyle(note);
  const metaParts: string[] = [];
  if (note.verseKeys.length > 0) metaParts.push(note.verseKeys.slice(0, 2).join(", ") + (note.verseKeys.length > 2 ? ` +${note.verseKeys.length - 2}` : ""));
  if (note.surahIds.length > 0) metaParts.push(note.surahIds.map((id) => getSurahName(id)).slice(0, 1).join(", ") + (note.surahIds.length > 1 ? ` +${note.surahIds.length - 1}` : ""));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(note.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(note.id); } }}
      className={cn(
        "relative cursor-pointer rounded-lg border border-border/50 p-3 transition-all hover:shadow-soft-sm hover:border-primary/30",
        sourceStyle.bg,
        note.pinned && "ring-1 ring-primary/20",
      )}
      style={{ borderLeft: `3px solid ${sourceStyle.borderColor}` }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {note.pinned && <Pin className="h-3 w-3 shrink-0 text-primary/60" />}
            {sourceStyle.dotColor && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sourceStyle.dotColor }} title={sourceStyle.label} />}
            <span className={cn("text-xs leading-snug", hasRealTitle ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>{displayTitle}</span>
          </div>
        </div>
        {/* Menu — stops click from propagating to card */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setShowMenu(!showMenu)} className="rounded-md p-1 text-muted-foreground/60 hover:bg-surface-hover hover:text-foreground transition-fast" aria-label="Note actions">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
                <button type="button" onClick={() => { setShowMenu(false); onTogglePin(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast">{note.pinned ? <><PinOff className="h-3 w-3" />Unpin</> : <><Pin className="h-3 w-3" />Pin</>}</button>
                <button type="button" onClick={() => { setShowMenu(false); onToggleSurahLink(note); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"><Link2 className="h-3 w-3" />{isLinkedToSurah ? "Unlink surah" : "Link surah"}</button>
                <button type="button" onClick={() => { setShowMenu(false); onDelete(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-fast"><Trash2 className="h-3 w-3" />Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Always show 2-line content preview for titled notes */}
      {hasRealTitle && (
        <div className="mt-1">
          <NoteContentRenderer content={note.content} contentJson={note.contentJson} className="line-clamp-2" />
        </div>
      )}
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        {metaParts.length > 0 && (<><MapPin className="h-2.5 w-2.5" /><span>{metaParts.join(" / ")}</span><span className="text-muted-foreground/30">&middot;</span></>)}
        {note.tags.length > 0 && (<><Tag className="h-2.5 w-2.5" /><span>{note.tags.length === 1 ? note.tags[0] : `${note.tags[0]} +${note.tags.length - 1}`}</span><span className="text-muted-foreground/30">&middot;</span></>)}
        {note.linkedResources && note.linkedResources.length > 0 && (<><BookText className="h-2.5 w-2.5" /><span>{note.linkedResources.length} linked</span><span className="text-muted-foreground/30">&middot;</span></>)}
        <span>{note.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}
