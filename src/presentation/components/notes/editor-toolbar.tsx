"use client";

import type { Editor } from "@tiptap/react";
import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon, LinkIcon, ListBulletsIcon, ListNumbersIcon, QuotesIcon, TextBolderIcon, TextHThreeIcon, TextHTwoIcon, TextItalicIcon } from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-fast",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <Icon className="h-3 w-3" weight={active ? "fill" : "bold"} />
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const handleLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <div className="flex flex-nowrap items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5">
      <ToolbarButton
        icon={TextBolderIcon}
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={TextItalicIcon}
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Divider />
      <ToolbarButton
        icon={TextHTwoIcon}
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        icon={TextHThreeIcon}
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <Divider />
      <ToolbarButton
        icon={ListBulletsIcon}
        label="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListNumbersIcon}
        label="Ordered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Divider />
      <ToolbarButton
        icon={QuotesIcon}
        label="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon={LinkIcon}
        label="Link"
        active={editor.isActive("link")}
        onClick={handleLink}
      />
      <ToolbarButton
        icon={ArrowCounterClockwiseIcon}
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={ArrowClockwiseIcon}
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
