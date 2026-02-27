"use client";

import { RobotIcon } from "@phosphor-icons/react";

export function AiSection() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="p-3" style={{ backgroundColor: 'var(--surah-lavender-bg)' }}>
        <RobotIcon weight="duotone" className="h-6 w-6" style={{ color: 'var(--surah-lavender-label)' }} />
      </div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
        Under Development
      </p>
      <p className="font-mono text-[10px] text-muted-foreground/50 max-w-[220px]">
        AI-powered verse analysis and contextual conversations coming soon.
      </p>
    </div>
  );
}
