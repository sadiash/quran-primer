"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { BookOpen } from "lucide-react";

export function VerseReferenceChip({ node }: NodeViewProps) {
  const { verseKey } = node.attrs as { verseKey: string; surahId: number };

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
        title={`Verse ${verseKey}`}
        role="button"
        tabIndex={0}
      >
        <BookOpen className="h-3 w-3" />
        {verseKey}
      </span>
    </NodeViewWrapper>
  );
}
