"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  ArrowLeft,
  Pencil,
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
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useNotes, type NoteSortOption } from "@/presentation/hooks/use-notes";
import { useToast } from "@/presentation/components/ui/toast";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { getSurahName } from "@/lib/surah-names";
import { noteLocationLabel } from "@/core/types/study";
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

export function NotesSection() {
  const { focusedVerseKey } = usePanels();

  if (!focusedVerseKey) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <div className="rounded-full bg-primary/5 p-3">
          <StickyNote className="h-6 w-6 text-primary/30" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground/70">
            No verse selected
          </p>
          <p className="text-[11px] text-muted-foreground/50 max-w-[200px]">
            Click on any verse while reading to view and add notes here
          </p>
        </div>
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
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [templateContent, setTemplateContent] = useState<string | undefined>(undefined);
  const [templateTag, setTemplateTag] = useState<string | undefined>(undefined);

  const editingNote = editingNoteId
    ? notes.find((n) => n.id === editingNoteId) ?? null
    : null;

  const sortedNotes = useMemo(
    () => sortNotes(notes, sortOption),
    [notes, sortOption, sortNotes],
  );

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

  /** Delete with undo toast */
  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      const noteToDelete = notes.find((n) => n.id === noteId);
      if (!noteToDelete) return;
      // Save a copy for undo
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

  /** One-click toggle: link/unlink note to the whole surah */
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
    setShowSortMenu(false);
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
        {notes.length > 1 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
              aria-label="Sort notes"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSortChange(opt.value)}
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
        )}
      </div>

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
      {sortedNotes.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Your notes
          </p>
          {sortedNotes.map((note) => (
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
  // Linked resource colors take priority
  const resources = note.linkedResources;
  const hasHadith = resources?.some((r) => r.type === "hadith");
  const hasTafsir = resources?.some((r) => r.type === "tafsir");
  if (hasHadith && hasTafsir) return { borderColor: "#a78bfa", dotColor: "#a78bfa", bg: "bg-violet-500/5", label: "Hadith + Tafsir" };
  if (hasHadith) return { borderColor: "#34d399", dotColor: "#34d399", bg: "bg-emerald-500/5", label: "Hadith" };
  if (hasTafsir) return { borderColor: "#fbbf24", dotColor: "#fbbf24", bg: "bg-amber-500/5", label: "Tafsir" };

  // Template tag colors
  const tags = note.tags;
  if (tags.includes("reflection")) return { borderColor: "#60a5fa", dotColor: "#60a5fa", bg: "bg-blue-500/5", label: "Reflection" };
  if (tags.includes("question")) return { borderColor: "#c084fc", dotColor: "#c084fc", bg: "bg-purple-500/5", label: "Question" };
  if (tags.includes("connection")) return { borderColor: "#2dd4bf", dotColor: "#2dd4bf", bg: "bg-teal-500/5", label: "Connection" };

  // Default for plain notes
  return { borderColor: "#64748b", dotColor: "", bg: "bg-card", label: "" };
}

function NoteCard({ note, surahId, surahName, onEdit, onDelete, onTogglePin, onToggleSurahLink }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isLinkedToSurah = note.surahIds.includes(surahId);
  const displayTitle = note.title || note.content.slice(0, 40) + (note.content.length > 40 ? "..." : "");
  const hasRealTitle = !!note.title;
  const sourceStyle = getNoteSourceStyle(note);
  const metaParts: string[] = [];
  if (note.verseKeys.length > 0) metaParts.push(note.verseKeys.slice(0, 2).join(", ") + (note.verseKeys.length > 2 ? ` +${note.verseKeys.length - 2}` : ""));
  if (note.surahIds.length > 0) metaParts.push(note.surahIds.map((id) => getSurahName(id)).slice(0, 1).join(", ") + (note.surahIds.length > 1 ? ` +${note.surahIds.length - 1}` : ""));

  return (
    <div
      className={cn("relative rounded-lg border border-border/50 p-3 transition-all hover:shadow-soft-sm", sourceStyle.bg, note.pinned && "ring-1 ring-primary/20")}
      style={{ borderLeft: `3px solid ${sourceStyle.borderColor}` }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => setExpanded(!expanded)} className="w-full text-left">
            <div className="flex items-center gap-1.5">
              {note.pinned && <Pin className="h-3 w-3 shrink-0 text-primary/60" />}
              {sourceStyle.dotColor && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sourceStyle.dotColor }} title={sourceStyle.label} />}
              <span className={cn("text-xs leading-snug", hasRealTitle ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>{displayTitle}</span>
            </div>
          </button>
        </div>
        <div className="relative shrink-0">
          <button type="button" onClick={() => setShowMenu(!showMenu)} className="rounded-md p-1 text-muted-foreground/60 hover:bg-surface-hover hover:text-foreground transition-fast" aria-label="Note actions">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
                <button type="button" onClick={() => { setShowMenu(false); onEdit(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"><Pencil className="h-3 w-3" />Edit</button>
                <button type="button" onClick={() => { setShowMenu(false); onTogglePin(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast">{note.pinned ? <><PinOff className="h-3 w-3" />Unpin</> : <><Pin className="h-3 w-3" />Pin</>}</button>
                <button type="button" onClick={() => { setShowMenu(false); onToggleSurahLink(note); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"><Link2 className="h-3 w-3" />{isLinkedToSurah ? "Unlink surah" : "Link surah"}</button>
                <button type="button" onClick={() => { setShowMenu(false); onDelete(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-fast"><Trash2 className="h-3 w-3" />Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
      {hasRealTitle && (
        <button type="button" onClick={() => setExpanded(!expanded)} className="mt-1 w-full text-left">
          <NoteContentRenderer content={note.content} contentJson={note.contentJson} className={expanded ? undefined : "line-clamp-2"} />
        </button>
      )}
      {!hasRealTitle && expanded && (
        <div className="mt-1"><NoteContentRenderer content={note.content} contentJson={note.contentJson} /></div>
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
