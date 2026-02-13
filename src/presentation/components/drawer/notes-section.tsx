"use client";

import { StickyNote } from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";

export function NotesSection() {
  const { focusedVerseKey } = usePanels();

  return (
    <div className="flex items-center gap-2 px-4 py-4 text-muted-foreground/70">
      <StickyNote className="h-4 w-4 shrink-0" />
      <p className="text-xs">
        {focusedVerseKey
          ? `Notes for verse ${focusedVerseKey} — coming soon`
          : "Select a verse to view and add notes"}
      </p>
    </div>
  );
}
