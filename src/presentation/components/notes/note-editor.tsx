"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { ArrowSquareOutIcon, BookBookmarkIcon, BookOpenIcon, XIcon } from "@phosphor-icons/react";
import { createNoteEditorExtensions } from "./editor-extensions";
import { EditorToolbar } from "./editor-toolbar";
import { TagInput } from "./tag-input";
import { ReferenceInput } from "./reference-input";
import type { LinkedResource } from "@/core/types/study";

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
  const titleRef = useRef<HTMLInputElement>(null);

  // Stable ref so the keyboard shortcut always calls the latest save
  const saveRef = useRef<() => void>(() => {});

  const [isEmpty, setIsEmpty] = useState(true);

  // Auto-focus the title on mount
  useEffect(() => {
    const timer = setTimeout(() => titleRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

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
          class: "tiptap outline-none px-3 py-2 min-h-[100px] text-sm text-foreground",
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
    <div className="flex flex-1 min-h-0 flex-col border border-border bg-background">
      {/* Title input */}
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title..."
        className="w-full border-b border-border/50 bg-transparent px-3 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground/30 outline-none"
      />

      {/* Editor toolbar + content */}
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      {/* Bottom metadata — compact, all in one area */}
      <div className="border-t border-border/50">
        {/* References */}
        {showReferences && (
          <ReferenceInput
            verseKeys={verseKeys}
            surahIds={surahIds}
            onChangeVerseKeys={setVerseKeys}
            onChangeSurahIds={setSurahIds}
          />
        )}

        {/* Linked Resources (compact) */}
        {linkedResources && linkedResources.length > 0 && (
          <div className="border-t border-border/30 px-3 py-2 space-y-1.5">
            {linkedResources.map((resource, idx) => (
              <div
                key={`${resource.type}-${resource.label}-${idx}`}
                className="flex items-center gap-2 text-[11px]"
              >
                {resource.type === "hadith" ? (
                  <BookBookmarkIcon weight="duotone" className="h-3 w-3 shrink-0" style={{ color: '#3ba892' }} />
                ) : (
                  <BookOpenIcon weight="duotone" className="h-3 w-3 shrink-0" style={{ color: '#b5a600' }} />
                )}
                <span className="font-medium text-foreground truncate flex-1">{resource.label}</span>
                {resource.sourceUrl && (
                  <a
                    href={resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <ArrowSquareOutIcon weight="bold" className="h-3 w-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveLinkedResource(idx)}
                  className="shrink-0 p-0.5 text-muted-foreground/30 hover:text-foreground transition-colors"
                  aria-label="Remove"
                >
                  <XIcon weight="bold" className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <TagInput tags={tags} onChange={setTags} suggestedTags={suggestedTags} />
      </div>

      {/* Save row — compact */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="bg-foreground px-3 py-1 text-[11px] font-medium text-background hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Save
        </button>
      </div>
    </div>
  );
}
