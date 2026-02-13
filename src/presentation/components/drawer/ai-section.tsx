"use client";

import { Bot } from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";

export function AiSection() {
  const { focusedVerseKey } = usePanels();

  return (
    <div className="flex items-center gap-2 px-4 py-4 text-muted-foreground/70">
      <Bot className="h-4 w-4 shrink-0" />
      <p className="text-xs">
        {focusedVerseKey
          ? `Chat about verse ${focusedVerseKey} — coming soon`
          : "Select a verse to start a contextual AI conversation"}
      </p>
    </div>
  );
}
