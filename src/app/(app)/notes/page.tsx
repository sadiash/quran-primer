"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  StickyNote,
  Search,
  Trash2,
  Tag,
  Plus,
  Pin,
  PinOff,
  ArrowUpDown,
  Download,
  Upload,
  FileJson,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  MapPin,
  Network,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useNotes, type NoteSortOption } from "@/presentation/hooks/use-notes";
import { useKnowledgeGraph } from "@/presentation/hooks/use-knowledge-graph";
import { MindMapView } from "@/presentation/components/knowledge/mind-map-view";
import { useToast } from "@/presentation/components/ui/toast";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { NoteDetailDrawer } from "@/presentation/components/notes/note-detail-drawer";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { noteLocationLabel } from "@/core/types/study";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";
import type { Note, LinkedResource, GraphNode } from "@/core/types";

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

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function notesToMarkdown(notes: Note[]): string {
  const lines: string[] = [];
  lines.push("# Quran Notes Export");
  lines.push("");
  lines.push(`Exported on ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push("");
  lines.push(`Total notes: ${notes.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const note of notes) {
    const location = noteLocationLabel(note, getSurahName);
    const heading = note.title || location;
    lines.push(`## ${heading}`);
    if (note.title) {
      lines.push(`*${location}*`);
    }
    lines.push("");
    if (note.pinned) {
      lines.push("**[Pinned]**");
      lines.push("");
    }
    lines.push(note.content);
    lines.push("");
    if (note.tags.length > 0) {
      lines.push(`Tags: ${note.tags.map((t) => `\`${t}\``).join(", ")}`);
      lines.push("");
    }
    if (note.verseKeys.length > 0) {
      lines.push(`Verses: ${note.verseKeys.join(", ")}`);
    }
    if (note.surahIds.length > 0) {
      lines.push(`Surahs: ${note.surahIds.map((id) => getSurahName(id)).join(", ")}`);
    }
    lines.push("");
    lines.push(
      `Created: ${note.createdAt.toLocaleDateString()} | Updated: ${note.updatedAt.toLocaleDateString()}`,
    );
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export default function NotesPage() {
  const { notes, saveNote, removeNote, togglePin, restoreNote, getAllNotes, importNotes, sortNotes, suggestedTags } =
    useNotes();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"notes" | "mindmap">("notes");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [sortOption, setSortOption] = useState<NoteSortOption>(loadSort);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // "new" = creating, note id = editing existing, null = closed
  const [editorMode, setEditorMode] = useState<"new" | string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingNote =
    editorMode && editorMode !== "new"
      ? notes.find((n) => n.id === editorMode) ?? null
      : null;

  // Unique tags across all notes with counts
  const tagData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes) {
      for (const t of n.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, count]) => ({ tag, count }));
  }, [notes]);

  const filtered = useMemo(() => {
    let result = notes;
    if (tagFilter) {
      result = result.filter((n) => n.tags.includes(tagFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((n) => {
        const vkMatch = n.verseKeys.some((vk) => vk.includes(q));
        const surahMatch = n.surahIds.some((id) =>
          getSurahName(id).toLowerCase().includes(q),
        );
        const vkSurahMatch = n.verseKeys.some((vk) => {
          const sid = Number(vk.split(":")[0]);
          return getSurahName(sid).toLowerCase().includes(q);
        });
        const titleMatch = n.title?.toLowerCase().includes(q) ?? false;
        return (
          titleMatch ||
          n.content.toLowerCase().includes(q) ||
          vkMatch ||
          surahMatch ||
          vkSurahMatch ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    return sortNotes(result, sortOption);
  }, [notes, search, tagFilter, sortOption, sortNotes]);

  const handleSaveNote = useCallback(
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
        id: editorMode !== "new" ? (editorMode ?? undefined) : undefined,
      });
      setEditorMode(null);
    },
    [saveNote, editorMode],
  );

  const handleCancelEditor = useCallback(() => {
    setEditorMode(null);
  }, []);

  const handleEditFromDrawer = useCallback(() => {
    if (selectedNote) {
      setEditorMode(selectedNote.id);
      setSelectedNote(null);
    }
  }, [selectedNote]);

  const handleDeleteFromDrawer = useCallback(
    async (id: string) => {
      const noteToDelete = notes.find((n) => n.id === id);
      if (!noteToDelete) return;
      const backup = { ...noteToDelete };
      await removeNote(id);
      setSelectedNote(null);
      addToast("Note deleted", "default", {
        label: "Undo",
        onClick: () => {
          restoreNote(backup);
        },
      });
    },
    [notes, removeNote, restoreNote, addToast],
  );

  const handleDeleteCard = useCallback(
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

  const handleSortChange = useCallback((value: NoteSortOption) => {
    setSortOption(value);
    saveSort(value);
    setShowSortMenu(false);
  }, []);

  const handleExportJSON = useCallback(async () => {
    const all = await getAllNotes();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(
      JSON.stringify(all, null, 2),
      `quran-notes-${dateStr}.json`,
      "application/json",
    );
    setShowExportMenu(false);
    addToast(`Exported ${all.length} notes as JSON`, "success");
  }, [getAllNotes, addToast]);

  const handleExportMarkdown = useCallback(async () => {
    const all = await getAllNotes();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(
      notesToMarkdown(all),
      `quran-notes-${dateStr}.md`,
      "text/markdown",
    );
    setShowExportMenu(false);
    addToast(`Exported ${all.length} notes as Markdown`, "success");
  }, [getAllNotes, addToast]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          addToast("Invalid file: expected an array of notes", "error");
          return;
        }

        // Basic validation
        const valid = parsed.filter(
          (n: Record<string, unknown>) =>
            typeof n.id === "string" &&
            typeof n.content === "string" &&
            Array.isArray(n.verseKeys) &&
            Array.isArray(n.surahIds) &&
            Array.isArray(n.tags),
        );

        if (valid.length === 0) {
          addToast("No valid notes found in the file", "error");
          return;
        }

        const result = await importNotes(valid as Note[]);
        addToast(
          `Imported ${result.imported} note${result.imported !== 1 ? "s" : ""}${result.skipped > 0 ? ` (${result.skipped} skipped as duplicate${result.skipped !== 1 ? "s" : ""})` : ""}`,
          "success",
        );
      } catch {
        addToast("Failed to parse file. Please use a valid JSON export.", "error");
      }

      // Reset file input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [importNotes, addToast],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notes"
          subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          icon={StickyNote}
        />
        <div className="flex items-center gap-2">
          {/* Import button */}
          {activeTab === "notes" && !editorMode && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            </>
          )}

          {/* Export dropdown */}
          {activeTab === "notes" && !editorMode && notes.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
                    >
                      <FileJson className="h-3.5 w-3.5" />
                      As JSON (backup)
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      As Markdown
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "notes" && !editorMode && (
            <button
              type="button"
              onClick={() => setEditorMode("new")}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={cn(
            "flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-fast",
            activeTab === "notes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <StickyNote className="h-4 w-4" />
          Notes
          {notes.length > 0 && (
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              activeTab === "notes" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}>
              {notes.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mindmap")}
          className={cn(
            "flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-fast",
            activeTab === "mindmap"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <Network className="h-4 w-4" />
          Mind Map
        </button>
      </div>

      {/* Mind Map Tab */}
      {activeTab === "mindmap" && (
        <NotesMindMap notes={notes} onSelectNote={setSelectedNote} />
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && editorMode && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-card p-4 shadow-soft-lg">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {editorMode === "new" ? "New Note" : "Edit Note"}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {editorMode === "new"
                ? "Add references to link this note to specific verses or surahs, or leave empty for a standalone note."
                : "Edit content and references below."}
            </p>
          </div>
          <NoteEditor
            key={editorMode}
            initialContent={editingNote?.contentJson ?? editingNote?.content}
            initialTitle={editingNote?.title ?? ""}
            initialTags={editingNote?.tags ?? []}
            initialVerseKeys={editingNote?.verseKeys ?? []}
            initialSurahIds={editingNote?.surahIds ?? []}
            initialLinkedResources={editingNote?.linkedResources}
            showReferences
            suggestedTags={suggestedTags}
            onSave={handleSaveNote}
            onCancel={handleCancelEditor}
          />
        </div>
      )}

      {activeTab === "notes" && notes.length > 0 && !editorMode && (
        <>
          {/* Search + Sort row */}
          <div className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes by content, surah, verse, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
                aria-label="Sort notes"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">
                  {SORT_OPTIONS.find((o) => o.value === sortOption)?.label}
                </span>
              </button>
              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSortChange(opt.value)}
                        className={cn(
                          "flex w-full items-center rounded-md px-3 py-2 text-xs transition-fast",
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
          </div>

          {/* Tag filter chips with counts */}
          {tagData.length > 0 && (
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
                <span className={cn(
                  "ml-0.5 text-[10px]",
                  tagFilter === null ? "text-primary-foreground/70" : "text-muted-foreground/50",
                )}>
                  {notes.length}
                </span>
              </button>
              {tagData.map(({ tag, count }) => (
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
                  <span className={cn(
                    "ml-0.5 text-[10px]",
                    tagFilter === tag ? "text-primary-foreground/70" : "text-muted-foreground/50",
                  )}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Note cards */}
      {activeTab === "notes" && <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((note) => {
          const label = noteLocationLabel(note, getSurahName);
          const displayTitle = note.title || note.content.slice(0, 50) + (note.content.length > 50 ? "..." : "");
          const hasRealTitle = !!note.title;
          return (
            <PageNoteCard
              key={note.id}
              note={note}
              displayTitle={displayTitle}
              hasRealTitle={hasRealTitle}
              locationLabel={label}
              onSelect={setSelectedNote}
              onEdit={setEditorMode}
              onTogglePin={togglePin}
              onDelete={handleDeleteCard}
            />
          );
        })}
      </div>}

      {activeTab === "notes" && notes.length === 0 && !editorMode && (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/5 p-4">
            <Lightbulb className="h-8 w-8 text-primary/30" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">
            Your notes will appear here
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Add notes while reading any surah, or create a standalone note
            to capture your thoughts and reflections.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/surah/1"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
            >
              Start reading
            </Link>
            <button
              type="button"
              onClick={() => setEditorMode("new")}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-fast"
            >
              Create note
            </button>
          </div>
          {/* Import hint when empty */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-muted-foreground/60 underline underline-offset-2 hover:text-muted-foreground transition-fast"
            >
              Or import notes from a backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      )}

      {activeTab === "notes" && notes.length > 0 && filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No notes match your search.
        </p>
      )}

      {/* Detail drawer */}
      <NoteDetailDrawer
        note={selectedNote}
        open={selectedNote !== null}
        onClose={() => setSelectedNote(null)}
        onEdit={handleEditFromDrawer}
        onDelete={handleDeleteFromDrawer}
      />
    </div>
  );
}

// ─── Mind Map Tab Content ───

function NotesMindMap({ notes: allNotes, onSelectNote }: { notes: Note[]; onSelectNote: (note: Note) => void }) {
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { nodes, edges, allTags, isLoading } = useKnowledgeGraph(
    tagFilter ? { tag: tagFilter } : undefined,
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.nodeType === "note") {
        const note = allNotes.find((n) => n.id === node.id.replace("note-", ""));
        if (note) onSelectNote(note);
      } else if (node.nodeType === "verse" && node.verseKey) {
        const [surahId] = node.verseKey.split(":");
        router.push(`/surah/${surahId}?verse=${node.verseKey}`);
      } else if (node.nodeType === "theme") {
        setTagFilter((prev) => (prev === node.label ? undefined : node.label));
      }
    },
    [allNotes, onSelectNote, router],
  );

  const isEmpty = !isLoading && nodes.length === 0;

  return (
    <div className="mt-6 flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mb-4 flex shrink-0 flex-wrap gap-1.5">
          <button
            onClick={() => setTagFilter(undefined)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-fast",
              tagFilter === undefined
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            )}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? undefined : tag)}
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

      {/* Legend */}
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary/20 ring-1 ring-primary/50" />
          Verse
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded border border-border bg-card" />
          Note
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-5 rounded-full bg-primary/20 ring-2 ring-primary" />
          Theme
        </span>
        <span className="ml-auto text-muted-foreground/60">
          {nodes.length} nodes, {edges.length} connections
        </span>
      </div>

      {/* Graph canvas */}
      <div className="relative min-h-0 flex-1 rounded-xl border border-border overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Network className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">No connections yet</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Your mind map builds automatically from your notes. Add notes with tags to see your knowledge graph grow.
              </p>
            </div>
          </div>
        ) : (
          <MindMapView
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}

/** Color-code note cards by source/type — matches panel colors */
function getNoteCardStyle(note: Note) {
  const resources = note.linkedResources;
  const hasHadith = resources?.some((r) => r.type === "hadith");
  const hasTafsir = resources?.some((r) => r.type === "tafsir");
  if (hasHadith && hasTafsir) return { borderColor: "#a78bfa", dotColor: "#a78bfa", label: "Hadith + Tafsir" };
  if (hasHadith) return { borderColor: "#34d399", dotColor: "#34d399", label: "Hadith" };
  if (hasTafsir) return { borderColor: "#fbbf24", dotColor: "#fbbf24", label: "Tafsir" };
  if (note.tags.includes("reflection")) return { borderColor: "#60a5fa", dotColor: "#60a5fa", label: "Reflection" };
  if (note.tags.includes("question")) return { borderColor: "#c084fc", dotColor: "#c084fc", label: "Question" };
  if (note.tags.includes("connection")) return { borderColor: "#2dd4bf", dotColor: "#2dd4bf", label: "Connection" };
  return { borderColor: "", dotColor: "", label: "" };
}

// ─── Page note card with title, overflow menu, compact metadata ───

function PageNoteCard({
  note,
  displayTitle,
  hasRealTitle,
  locationLabel,
  onSelect,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  note: Note;
  displayTitle: string;
  hasRealTitle: boolean;
  locationLabel: string;
  onSelect: (note: Note) => void;
  onEdit: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const cardStyle = getNoteCardStyle(note);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft-sm cursor-pointer",
        note.pinned && "border-primary/20 bg-primary/[0.02]",
      )}
      style={cardStyle.borderColor ? { borderLeft: `3px solid ${cardStyle.borderColor}` } : undefined}
      onClick={() => onSelect(note)}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {/* Title row with pin + color dot */}
          <div className="flex items-center gap-1.5">
            {note.pinned && <Pin className="h-3 w-3 shrink-0 text-primary/60" />}
            {cardStyle.dotColor && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cardStyle.dotColor }} title={cardStyle.label} />}
            <span className={cn("text-sm leading-snug", hasRealTitle ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
              {displayTitle}
            </span>
          </div>
          {/* Content preview when there is a real title */}
          {hasRealTitle && (
            <NoteContentRenderer
              content={note.content}
              contentJson={note.contentJson}
              className="mt-1.5 line-clamp-2"
            />
          )}
          {/* Compact metadata row */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <MapPin className="h-2.5 w-2.5" />
            <span>{locationLabel}</span>
            {note.tags.length > 0 && (
              <>
                <span className="text-muted-foreground/30">&middot;</span>
                <Tag className="h-2.5 w-2.5" />
                <span>{note.tags.length === 1 ? note.tags[0] : `${note.tags[0]} +${note.tags.length - 1}`}</span>
              </>
            )}
            <span className="text-muted-foreground/30">&middot;</span>
            <span>{note.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
        </div>
        {/* Always-visible overflow menu */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-md p-1.5 text-muted-foreground/50 hover:bg-surface-hover hover:text-foreground transition-fast"
            aria-label="Note actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
                <button type="button" onClick={() => { setShowMenu(false); onEdit(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast">
                  <Pencil className="h-3 w-3" />Edit
                </button>
                <button type="button" onClick={() => { setShowMenu(false); onTogglePin(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast">
                  {note.pinned ? <><PinOff className="h-3 w-3" />Unpin</> : <><Pin className="h-3 w-3" />Pin</>}
                </button>
                <button type="button" onClick={() => { setShowMenu(false); onDelete(note.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-fast">
                  <Trash2 className="h-3 w-3" />Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
