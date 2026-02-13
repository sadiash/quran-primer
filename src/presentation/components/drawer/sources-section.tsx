"use client";

import { ExternalLink } from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";

export function SourcesSection() {
  const { focusedVerseKey } = usePanels();

  return (
    <div className="flex items-center gap-2 px-4 py-4 text-muted-foreground/70">
      <ExternalLink className="h-4 w-4 shrink-0" />
      <p className="text-xs">
        {focusedVerseKey
          ? `YouTube lectures, cross-references for ${focusedVerseKey} — coming soon`
          : "Select a verse to see related sources"}
      </p>
    </div>
  );
}
