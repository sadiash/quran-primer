"use client";

import { GraphIcon } from "@phosphor-icons/react";
import { PageHeader } from "@/presentation/components/layout/page-header";

export default function MindMapPage() {
  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="shrink-0 px-4 pt-6 pb-2 sm:px-6">
        <PageHeader title="Knowledge Graph" subtitle="Mind map" icon={GraphIcon} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="p-3" style={{ backgroundColor: 'var(--surah-lavender-bg)' }}>
          <GraphIcon weight="duotone" className="h-6 w-6" style={{ color: 'var(--surah-lavender-label)' }} />
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
          Under Development
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/50 max-w-[220px]">
          A visual mind map connecting your notes, bookmarks, and reading insights — coming soon.
        </p>
      </div>
    </div>
  );
}
