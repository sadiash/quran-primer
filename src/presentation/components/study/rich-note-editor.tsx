"use client";

import { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  BookOpen,
  Clipboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VerseReferenceNode } from "@/presentation/extensions/verse-reference-node";
import { ScriptureClipNode } from "@/presentation/extensions/scripture-clip-node";

interface RichNoteEditorProps {
  content?: string;
  onChange?: (json: string, text: string) => void;
  editable?: boolean;
  className?: string;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export function RichNoteEditor({
  content,
  onChange,
  editable = true,
  className,
}: RichNoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-2 cursor-pointer",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
      VerseReferenceNode,
      ScriptureClipNode,
    ],
    content: parseContent(content),
    editable,
    onCreate: ({ editor: ed }) => {
      // Populate the parent with initial content so save works even without edits
      if (ed.getText().trim()) {
        onChange?.(JSON.stringify(ed.getJSON()), ed.getText());
      }
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(JSON.stringify(ed.getJSON()), ed.getText());
    },
  });

  const insertLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const insertVerseReference = useCallback(() => {
    if (!editor) return;
    const input = window.prompt("Enter verse key (e.g. 2:255):");
    if (!input) return;
    const match = input.match(/^(\d+):(\d+)$/);
    if (!match) return;
    const surahId = Number(match[1]);
    const verseKey = input;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "verseReference",
        attrs: { verseKey, surahId },
      })
      .run();
  }, [editor]);

  const insertScriptureClip = useCallback(() => {
    if (!editor) return;
    const sourceType = window.prompt(
      "Source type (tafsir, hadith, or crossref):",
    );
    if (!sourceType || !["tafsir", "hadith", "crossref"].includes(sourceType))
      return;
    const sourceLabel = window.prompt("Source label (e.g. Ibn Kathir):") ?? "";
    const text = window.prompt("Clip text:");
    if (!text) return;
    const verseKey = window.prompt("Related verse key (e.g. 2:255):") ?? "";
    editor
      .chain()
      .focus()
      .insertContent({
        type: "scriptureClip",
        attrs: {
          sourceType: sourceType as "tafsir" | "hadith" | "crossref",
          sourceLabel,
          text,
          verseKey,
        },
      })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background/80 backdrop-blur-sm",
        "focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50",
        className,
      )}
    >
      {editable && (
        <div
          className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1"
          role="toolbar"
          aria-label="Formatting toolbar"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Heading"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton onClick={insertLink} title="Insert Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={insertVerseReference}
            title="Insert Verse Reference"
          >
            <BookOpen className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={insertScriptureClip}
            title="Insert Scripture Clip"
          >
            <Clipboard className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 [&_.tiptap]:min-h-[120px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}

/**
 * Parse content string into TipTap-compatible format.
 * If the content is valid JSON (TipTap JSON), parse it.
 * If it's plain text, wrap it in a simple document structure.
 * If empty/undefined, return undefined (editor uses default empty doc).
 */
function parseContent(
  content: string | undefined,
): Record<string, unknown> | string | undefined {
  if (!content) return undefined;

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    // Check if it looks like TipTap JSON
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return parsed;
    }
    // Not TipTap JSON, treat as plain text
    return wrapPlainText(content);
  } catch {
    // Not JSON, treat as plain text
    return wrapPlainText(content);
  }
}

/**
 * Wrap plain text content into a simple TipTap document with paragraphs.
 */
function wrapPlainText(text: string): Record<string, unknown> {
  const paragraphs = text.split("\n").map((line) => ({
    type: "paragraph" as const,
    content: line ? [{ type: "text" as const, text: line }] : [],
  }));

  return {
    type: "doc",
    content: paragraphs,
  };
}
