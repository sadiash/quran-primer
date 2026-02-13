"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import type { ScriptureClipSourceType } from "@/presentation/extensions/scripture-clip-node";

const SOURCE_BADGE_STYLES: Record<ScriptureClipSourceType, string> = {
  tafsir: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  hadith:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  crossref:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const SOURCE_BORDER_STYLES: Record<ScriptureClipSourceType, string> = {
  tafsir: "border-l-blue-400 dark:border-l-blue-500",
  hadith: "border-l-green-400 dark:border-l-green-500",
  crossref: "border-l-amber-400 dark:border-l-amber-500",
};

const SOURCE_LABELS: Record<ScriptureClipSourceType, string> = {
  tafsir: "Tafsir",
  hadith: "Hadith",
  crossref: "Cross-Reference",
};

export function ScriptureClipBlock({ node }: NodeViewProps) {
  const { sourceType, sourceLabel, text, verseKey } = node.attrs as {
    sourceType: ScriptureClipSourceType;
    sourceLabel: string;
    text: string;
    verseKey: string;
  };

  return (
    <NodeViewWrapper>
      <div
        className={cn(
          "my-2 rounded-md border-l-4 bg-muted/50 p-3",
          SOURCE_BORDER_STYLES[sourceType] ?? SOURCE_BORDER_STYLES.tafsir,
        )}
        data-testid="scripture-clip"
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              SOURCE_BADGE_STYLES[sourceType] ?? SOURCE_BADGE_STYLES.tafsir,
            )}
          >
            {SOURCE_LABELS[sourceType] ?? sourceType}
          </span>
          {sourceLabel && (
            <span className="text-xs text-muted-foreground">
              {sourceLabel}
            </span>
          )}
          {verseKey && (
            <span className="text-xs text-muted-foreground">
              ({verseKey})
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
      </div>
    </NodeViewWrapper>
  );
}
