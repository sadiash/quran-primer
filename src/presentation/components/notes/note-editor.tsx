"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { ArrowSquareOutIcon, BookBookmarkIcon, BookOpenIcon, XIcon } from "@phosphor-icons/react";
import { createNoteEditorExtensions } from "./editor-extensions";
import { EditorToolbar } from "./editor-toolbar";
import { TagInput } from "./tag-input";
import { ReferenceInput } from "./reference-input";
import type { LinkedResource } from "@/core/types/study";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  initialContent?: string; // TipTap JSON string or plain text fallback
  initialTitle?: string;
  initialTags: string[];
  initialVerseKeys?: string[];
  initialSurahIds?: number[];
  /** Linked hadith/tafsir resources (read-only display, can be removed) */
  initialLinkedResources?: LinkedResource[];
  /** Show reference chip input. Defaults to true. */
  showReferences?: boolean;
  /** Suggested tags from existing notes */
  suggestedTags?: string[];
  onSave: (data: {
    title?: string;
    content: string;
    contentJson: string;
    tags: string[];
    verseKeys: string[];
    surahIds: number[];
    linkedResources?: LinkedResource[];
  }) => void;
  onCancel: () => void;
}

export function NoteEditor({
  initialContent,
  initialTitle = "",
  initialTags,
  initialVerseKeys = [],
  initialSurahIds = [],
  initialLinkedResources,
  showReferences = true,
  suggestedTags,
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState(initialTags);
  const [verseKeys, setVerseKeys] = useState(initialVerseKeys);
  const [surahIds, setSurahIds] = useState(initialSurahIds);
  const [linkedResources, setLinkedResources] = useState<LinkedResource[] | undefined>(initialLinkedResources);

  // Stable ref so the keyboard shortcut always calls the latest save
  const saveRef = useRef<() => void>(() => {});

  const [isEmpty, setIsEmpty] = useState(true);

  const parsedInitialContent = (() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent);
    } catch {
      // Old plain-text note — wrap in a paragraph
      return `<p>${initialContent}</p>`;
    }
  })();

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: createNoteEditorExtensions(),
      content: parsedInitialContent,
      onCreate: ({ editor: e }) => {
        setIsEmpty(e.getText({ blockSeparator: "\n" }).trim() === "");
      },
      onUpdate: ({ editor: e }) => {
        setIsEmpty(e.getText({ blockSeparator: "\n" }).trim() === "");
      },
      editorProps: {
        attributes: {
          class: "tiptap outline-none px-3 py-2 min-h-[180px] text-sm text-foreground",
        },
        handleKeyDown: (_view, event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            saveRef.current();
            return true;
          }
          return false;
        },
      },
    },
  );

  const handleSave = useCallback(() => {
    if (!editor) return;
    const plainText = editor.getText({ blockSeparator: "\n" }).trim();
    if (!plainText) return;
    const trimmedTitle = title.trim();
    onSave({
      title: trimmedTitle || undefined,
      content: plainText,
      contentJson: JSON.stringify(editor.getJSON()),
      tags,
      verseKeys,
      surahIds,
      linkedResources,
    });
  }, [editor, title, tags, verseKeys, surahIds, linkedResources, onSave]);

  const handleRemoveLinkedResource = useCallback((index: number) => {
    setLinkedResources((prev) => {
      if (!prev) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : undefined;
    });
  }, []);

  // Keep the ref in sync
  saveRef.current = handleSave;

  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-lg border border-border bg-card">
      {/* Title input */}
      <div className="border-b border-border">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your note a title..."
          className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
      </div>

      {/* Editor toolbar + content */}
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      {/* References — below editor content */}
      {showReferences && (
        <div className="border-t border-border">
          <ReferenceInput
            verseKeys={verseKeys}
            surahIds={surahIds}
            onChangeVerseKeys={setVerseKeys}
            onChangeSurahIds={setSurahIds}
          />
        </div>
      )}

      {/* Linked Resources (read-only, removable) */}
      {linkedResources && linkedResources.length > 0 && (
        <div className="border-t border-border px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Linked Resources
          </p>
          {linkedResources.map((resource, idx) => (
            <div
              key={`${resource.type}-${resource.label}-${idx}`}
              className={cn(
                "rounded-lg border p-2.5 space-y-1",
                resource.type === "hadith"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-amber-500/20 bg-amber-500/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {resource.type === "hadith" ? (
                    <BookBookmarkIcon className="h-3 w-3 shrink-0 text-emerald-500" />
                  ) : (
                    <BookOpenIcon className="h-3 w-3 shrink-0 text-amber-500" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate">
                    {resource.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLinkedResource(idx)}
                  className="shrink-0 rounded-md p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-fast"
                  aria-label="Remove linked resource"
                  title="Remove"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed">
                {resource.preview}
              </p>
              {resource.sourceUrl && (
                <a
                  href={resource.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowSquareOutIcon className="h-2.5 w-2.5" />
                  View source
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="border-t border-border">
        <TagInput tags={tags} onChange={setTags} suggestedTags={suggestedTags} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-fast disabled:opacity-40 disabled:pointer-events-none"
        >
          Save
        </button>
      </div>
    </div>
  );
}
