"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { generateHTML } from "@tiptap/react";
import { createNoteRenderExtensions } from "./editor-extensions";
import { cn } from "@/lib/utils";

interface NoteContentRendererProps {
  content: string;
  contentJson?: string;
  className?: string;
}

const renderExtensions = createNoteRenderExtensions();

export function NoteContentRenderer({
  content,
  contentJson,
  className,
}: NoteContentRendererProps) {
  const html = useMemo(() => {
    if (!contentJson) return null;
    try {
      const json = JSON.parse(contentJson);
      const raw = generateHTML(json, renderExtensions);
      return DOMPurify.sanitize(raw);
    } catch {
      return null;
    }
  }, [contentJson]);

  if (html) {
    return (
      <div
        className={cn("tiptap text-sm text-foreground/80", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Fallback: plain text
  return (
    <p className={cn("whitespace-pre-wrap text-sm text-foreground/80", className)}>
      {content}
    </p>
  );
}
