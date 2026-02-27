"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowsDownUpIcon, CircleNotchIcon, GraphIcon, LightbulbIcon, MagnifyingGlassIcon, MapPinIcon, NoteIcon, PencilSimpleIcon, PlusIcon, PushPinIcon, PushPinSlashIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";
import { useNotes, type NoteSortOption } from "@/presentation/hooks/use-notes";
import { useKnowledgeGraph } from "@/presentation/hooks/use-knowledge-graph";
import { NetworkGraph } from "@/presentation/components/knowledge";
import { useToast } from "@/presentation/components/ui/toast";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { NoteContentRenderer } from "@/presentation/components/notes/note-content-renderer";
import { NoteEditor } from "@/presentation/components/notes/note-editor";
import { noteLocationLabel } from "@/core/types/study";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/surah-colors";
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

export default function NotesPage() {
  const { notes, saveNote, removeNote, togglePin, restoreNote, sortNotes, suggestedTags } =
    useNotes();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"notes" | "mindmap">("notes");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<NoteSortOption>(loadSort);
  const [showSortMenu, setShowSortMenu] = useState(false);
  // expanded = read-only expanded card, editorMode = inline editor
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // "new" = creating, note id = editing existing, null = closed
  const [editorMode, setEditorMode] = useState<"new" | string | null>(null);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notes"
          subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          icon={NoteIcon}
        />
        {activeTab === "notes" && !editorMode && (
          <button
            type="button"
            onClick={() => setEditorMode("new")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] hover:opacity-80 transition-colors" style={{ backgroundColor: '#e8e337' }}
          >
            <PlusIcon weight="bold" className="h-4 w-4" />
            New Note
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={cn(
            "flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors",
            activeTab === "notes"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <NoteIcon weight="duotone" className="h-4 w-4" />
          Notes
          {notes.length > 0 && (
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              activeTab === "notes" ? "bg-[#fefce8] text-foreground" : "bg-muted text-muted-foreground",
            )}>
              {notes.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mindmap")}
          className={cn(
            "flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors",
            activeTab === "mindmap"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <GraphIcon weight="duotone" className="h-4 w-4" />
          Mind Map
        </button>
      </div>

      {/* Mind Map Tab */}
      {activeTab === "mindmap" && (
        <NotesMindMap notes={notes} onSelectNote={(note) => { setActiveTab("notes"); setExpandedId(note.id); }} />
      )}

      {activeTab === "notes" && notes.length > 0 && !editorMode && (
        <>
          {/* Search + Sort row */}
          <div className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon weight="duotone" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes by content, surah, verse, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
              />
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground hover:bg-[#fafafa] hover:text-foreground transition-colors"
                aria-label="Sort notes"
              >
                <ArrowsDownUpIcon weight="bold" className="h-4 w-4" />
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
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-border bg-background p-1 shadow-md">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSortChange(opt.value)}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-xs transition-colors",
                          sortOption === opt.value
                            ? "bg-[#fefce8] text-foreground font-medium"
                            : "text-muted-foreground hover:bg-[#fafafa] hover:text-foreground",
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
                  "flex items-center gap-1 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
                  tagFilter === null
                    ? "bg-[#fefce8] text-foreground"
                    : "border border-border text-muted-foreground hover:bg-[#fafafa] hover:text-foreground",
                )}
              >
                All
                <span className={cn(
                  "ml-0.5 text-[10px]",
                  tagFilter === null ? "text-foreground/70" : "text-muted-foreground/50",
                )}>
                  {notes.length}
                </span>
              </button>
              {tagData.map(({ tag, count }) => {
                const color = getTagColor(tag);
                const isActive = tagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      setTagFilter(isActive ? null : tag)
                    }
                    className="flex items-center gap-1 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                    style={isActive
                      ? { backgroundColor: color.bg, color: color.text, borderLeft: `3px solid ${color.accent}` }
                      : { borderLeft: `3px solid ${color.accent}`, color: color.label }
                    }
                  >
                    <TagIcon weight="bold" className="h-3 w-3" />
                    {tag}
                    <span className="ml-0.5 text-[10px] opacity-60">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Note cards + inline editor */}
      {activeTab === "notes" && <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* New note editor — full width at top */}
        {editorMode === "new" && (
          <div className="col-span-full">
            <NoteEditor
              key="new"
              initialTitle=""
              initialTags={[]}
              initialVerseKeys={[]}
              initialSurahIds={[]}
              showReferences
              suggestedTags={suggestedTags}
              onSave={handleSaveNote}
              onCancel={handleCancelEditor}
            />
          </div>
        )}
        {filtered.map((note) => {
          // Inline editor for this note
          if (editorMode === note.id) {
            return (
              <div key={note.id} className="col-span-full">
                <NoteEditor
                  key={`edit-${note.id}`}
                  initialContent={note.contentJson ?? note.content}
                  initialTitle={note.title ?? ""}
                  initialTags={note.tags}
                  initialVerseKeys={note.verseKeys}
                  initialSurahIds={note.surahIds}
                  initialLinkedResources={note.linkedResources}
                  showReferences
                  suggestedTags={suggestedTags}
                  onSave={handleSaveNote}
                  onCancel={handleCancelEditor}
                />
              </div>
            );
          }
          // Expanded read-only view
          if (expandedId === note.id) {
            return (
              <ExpandedNoteCard
                key={note.id}
                note={note}
                onCollapse={() => setExpandedId(null)}
                onEdit={() => { setExpandedId(null); setEditorMode(note.id); }}
                onDelete={() => handleDeleteCard(note.id)}
                onTogglePin={() => togglePin(note.id)}
              />
            );
          }
          // Collapsed card
          const label = noteLocationLabel(note, getSurahName);
          const displayTitle = note.title || note.content.slice(0, 50) + (note.content.length > 50 ? "..." : "");
          const hasRealTitle = !!note.title;
          const isDimmed = expandedId !== null || editorMode !== null;
          return (
            <PageNoteCard
              key={note.id}
              note={note}
              displayTitle={displayTitle}
              hasRealTitle={hasRealTitle}
              locationLabel={label}
              isDimmed={isDimmed}
              onExpand={() => { setExpandedId(note.id); setEditorMode(null); }}
              onEdit={(id) => { setExpandedId(null); setEditorMode(id); }}
              onTogglePin={togglePin}
              onDelete={handleDeleteCard}
            />
          );
        })}
      </div>}

      {activeTab === "notes" && notes.length === 0 && !editorMode && (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="p-4" style={{ backgroundColor: '#fefce8' }}>
            <LightbulbIcon weight="duotone" className="h-8 w-8 text-muted-foreground/30" />
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
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] hover:opacity-80 transition-colors" style={{ backgroundColor: '#e8e337' }}
            >
              Start reading
            </Link>
            <button
              type="button"
              onClick={() => setEditorMode("new")}
              className="border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-[#fafafa] transition-colors"
            >
              Create note
            </button>
          </div>
        </div>
      )}

      {activeTab === "notes" && notes.length > 0 && filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No notes match your search.
        </p>
      )}

    </div>
  );
}

// ─── Mind Map Tab Content ───

function NotesMindMap({ notes: allNotes, onSelectNote }: { notes: Note[]; onSelectNote: (note: Note) => void }) {
  const router = useRouter();

  // Ontology toggles
  const [includeOntologyHadiths, setIncludeOntologyHadiths] = useState(false);
  const [includeQuranicConcepts, setIncludeQuranicConcepts] = useState(false);
  const [includeHadithTopics, setIncludeHadithTopics] = useState(false);

  const { nodes, edges, allTags, stats, isLoading } = useKnowledgeGraph({
    includeOntologyHadiths,
    includeQuranicConcepts,
    includeHadithTopics,
  });

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.nodeType === "note") {
        const note = allNotes.find((n) => n.id === node.id.replace("note:", ""));
        if (note) onSelectNote(note);
      } else if (node.nodeType === "verse" && node.verseKey) {
        const [surahId] = node.verseKey.split(":");
        router.push(`/surah/${surahId}?verse=${node.verseKey}`);
      }
    },
    [allNotes, onSelectNote, router],
  );

  const isEmpty = !isLoading && nodes.length === 0;

  return (
    <div className="mt-4 flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
      <div className="relative min-h-0 flex-1 border border-border overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <CircleNotchIcon weight="bold" className="h-6 w-6 animate-spin text-foreground" />
          </div>
        )}
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <GraphIcon weight="duotone" className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">No connections yet</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Your knowledge graph builds automatically from your notes. Add notes with tags to see it grow.
              </p>
            </div>
          </div>
        ) : (
          <NetworkGraph
            nodes={nodes}
            edges={edges}
            stats={stats}
            allTags={allTags}
            onNodeClick={handleNodeClick}
            className="h-full"
            includeOntologyHadiths={includeOntologyHadiths}
            onToggleOntologyHadiths={() => setIncludeOntologyHadiths((v) => !v)}
            includeQuranicConcepts={includeQuranicConcepts}
            onToggleQuranicConcepts={() => setIncludeQuranicConcepts((v) => !v)}
            includeHadithTopics={includeHadithTopics}
            onToggleHadithTopics={() => setIncludeHadithTopics((v) => !v)}
          />
        )}
      </div>
    </div>
  );
}

/** Color-code note cards by first tag — matches filter chip colors */
function getNoteCardStyle(note: Note) {
  const tag = note.tags[0];
  if (!tag) return { borderColor: "", dotColor: "", label: "" };
  const color = getTagColor(tag);
  return { borderColor: color.accent, dotColor: color.accent, label: tag };
}

// ─── Page note card with title, overflow menu, compact metadata ───

function PageNoteCard({
  note,
  displayTitle,
  hasRealTitle,
  locationLabel,
  isDimmed,
  onExpand,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  note: Note;
  displayTitle: string;
  hasRealTitle: boolean;
  locationLabel: string;
  isDimmed?: boolean;
  onExpand: () => void;
  onEdit: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cardStyle = getNoteCardStyle(note);

  return (
    <div
      className={cn(
        "relative border border-border bg-background p-4 transition-all hover:bg-[#fafafa] cursor-pointer",
        note.pinned && "border-border bg-[#fefce8]/30",
        isDimmed && "opacity-40",
      )}
      style={cardStyle.borderColor ? { borderLeft: `3px solid ${cardStyle.borderColor}` } : undefined}
      onClick={onExpand}
    >
      <div className="min-w-0">
        {/* Title row with pin + color dot */}
        <div className="flex items-center gap-1.5">
          {note.pinned && <PushPinIcon weight="fill" className="h-3 w-3 shrink-0 text-foreground/60" />}
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
          <MapPinIcon weight="bold" className="h-2.5 w-2.5" />
          <span>{locationLabel}</span>
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
    </div>
  );
}

// ─── Expanded read-only note card ───

function ExpandedNoteCard({
  note,
  onCollapse,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onCollapse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const cardStyle = getNoteCardStyle(note);

  return (
    <div
      className="col-span-full border-2 bg-background"
      style={{ borderColor: cardStyle.borderColor || 'hsl(var(--border))' }}
    >
      {/* Header — actions bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="flex items-center gap-2">
          {cardStyle.label && (
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{ color: cardStyle.dotColor }}
            >
              {cardStyle.label}
            </span>
          )}
          {note.pinned && <PushPinIcon weight="fill" className="h-3 w-3 text-foreground/50" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onTogglePin}
            className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label={note.pinned ? "Unpin" : "Pin"}
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned
              ? <PushPinSlashIcon weight="bold" className="h-3.5 w-3.5" />
              : <PushPinIcon weight="bold" className="h-3.5 w-3.5" />
            }
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Edit"
            title="Edit"
          >
            <PencilSimpleIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Delete"
            title="Delete"
          >
            <TrashIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onCollapse}
            className="ml-1 p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Collapse"
            title="Collapse"
          >
            <span className="font-mono text-[10px] font-bold">&times;</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {note.title && (
          <h3 className="text-base font-semibold text-foreground">{note.title}</h3>
        )}
        <NoteContentRenderer
          content={note.content}
          contentJson={note.contentJson}
        />
        {/* Verse/surah references as clickable links */}
        {(note.verseKeys.length > 0 || note.surahIds.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <MapPinIcon weight="bold" className="h-3 w-3 text-muted-foreground/40" />
            {note.verseKeys.map((vk) => {
              const [s] = vk.split(":");
              return (
                <Link
                  key={vk}
                  href={`/surah/${s}?verse=${vk}`}
                  className="font-mono text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {getSurahName(Number(s))} {vk}
                </Link>
              );
            })}
            {note.surahIds.map((id) => (
              <Link
                key={`s-${id}`}
                href={`/surah/${id}`}
                className="font-mono text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                {getSurahName(id)}
              </Link>
            ))}
          </div>
        )}
        {/* Linked resources (hadith, tafsir) */}
        {note.linkedResources && note.linkedResources.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {note.linkedResources.map((resource, idx) => (
              <div
                key={`${resource.type}-${idx}`}
                className="border border-border/50 px-3 py-2 text-[11px]"
              >
                <span className="font-medium text-foreground">{resource.label}</span>
                {resource.preview && (
                  <p className="mt-0.5 text-muted-foreground/60 line-clamp-2">{resource.preview}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="font-mono text-[10px] text-muted-foreground/30 text-right">
          {note.updatedAt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}
