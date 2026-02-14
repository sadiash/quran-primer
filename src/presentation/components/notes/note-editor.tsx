"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { createNoteEditorExtensions } from "./editor-extensions";
import { EditorToolbar } from "./editor-toolbar";
import { TagInput } from "./tag-input";
import { ReferenceInput } from "./reference-input";

interface NoteEditorProps {
  initialContent?: string; // TipTap JSON string or plain text fallback
  initialTags: string[];
  initialVerseKeys?: string[];
  initialSurahIds?: number[];
  /** Show reference chip input. Defaults to true. */
  showReferences?: boolean;
  onSave: (data: {
    content: string;
    contentJson: string;
    tags: string[];
    verseKeys: string[];
    surahIds: number[];
  }) => void;
  onCancel: () => void;
}

export function NoteEditor({
  initialContent,
  initialTags,
  initialVerseKeys = [],
  initialSurahIds = [],
  showReferences = true,
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [tags, setTags] = useState(initialTags);
  const [verseKeys, setVerseKeys] = useState(initialVerseKeys);
  const [surahIds, setSurahIds] = useState(initialSurahIds);

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
          class: "tiptap outline-none px-3 py-2 min-h-[120px] text-sm text-foreground",
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
    onSave({
      content: plainText,
      contentJson: JSON.stringify(editor.getJSON()),
      tags,
      verseKeys,
      surahIds,
    });
  }, [editor, tags, verseKeys, surahIds, onSave]);

  // Keep the ref in sync
  saveRef.current = handleSave;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      {/* References — visible and editable */}
      {showReferences && (
        <div className="border-b border-border">
          <div className="px-3 pt-2 pb-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              References
            </span>
          </div>
          <ReferenceInput
            verseKeys={verseKeys}
            surahIds={surahIds}
            onChangeVerseKeys={setVerseKeys}
            onChangeSurahIds={setSurahIds}
          />
        </div>
      )}
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
      <div className="border-t border-border">
        <TagInput tags={tags} onChange={setTags} />
      </div>
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
