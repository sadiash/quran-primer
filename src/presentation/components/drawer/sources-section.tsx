"use client";

import { ArrowSquareOutIcon, BookOpenIcon, CaretRightIcon } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { PanelBreadcrumb } from "@/presentation/components/panels/panel-breadcrumb";

/** Dummy cross-references keyed by surah:verse prefix */
const CROSS_REFS: Record<string, { verse: string; text: string; theme: string }[]> = {
  "2": [
    { verse: "3:3-4", text: "He has revealed to you the Book with truth, confirming what came before it", theme: "Revelation" },
    { verse: "10:37", text: "This Quran could not have been produced by anyone other than Allah", theme: "Divine Origin" },
    { verse: "17:9", text: "This Quran guides to what is most upright", theme: "Guidance" },
    { verse: "6:155", text: "This is a blessed Book We have revealed — so follow it", theme: "Following the Book" },
  ],
  "1": [
    { verse: "6:1", text: "All praise is for Allah Who created the heavens and the earth", theme: "Praise" },
    { verse: "17:111", text: "Say: Praise be to Allah, who has not taken a son", theme: "Praise" },
    { verse: "35:1", text: "All praise is for Allah, the Originator of the heavens and the earth", theme: "Praise" },
  ],
};

export function SourcesSection() {
  const { focusedVerseKey } = usePanels();

  if (!focusedVerseKey) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <ArrowSquareOutIcon weight="duotone" className="h-6 w-6 text-muted-foreground/20" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Select a verse to see cross-references
        </p>
      </div>
    );
  }

  const surahId = focusedVerseKey.split(":")[0] ?? "1";
  const refs = CROSS_REFS[surahId] ?? CROSS_REFS["2"]!;

  return (
    <div className="flex flex-col gap-4 p-4">
      <PanelBreadcrumb items={[
        { label: `Verse ${focusedVerseKey}` },
        { label: "Sources" },
      ]} />

      {/* Cross-references */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpenIcon weight="duotone" className="h-3.5 w-3.5 text-muted-foreground/60" />
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
            Cross-References
          </h3>
        </div>
        <div className="space-y-1">
          {refs.map((ref) => (
            <button
              key={ref.verse}
              className="group flex w-full items-start gap-2 border border-transparent p-2 text-left transition-colors hover:bg-highlight"
            >
              <span
                className="shrink-0 font-mono text-[10px] font-bold mt-0.5 px-1.5 py-0.5"
                style={{ backgroundColor: 'var(--surah-teal-bg)', color: 'var(--surah-teal-label)' }}
              >
                {ref.verse}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {ref.text}
                </p>
                <span
                  className="inline-flex items-center mt-0.5 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--surah-lavender-bg)', color: 'var(--surah-lavender-label)' }}
                >
                  {ref.theme}
                </span>
              </div>
              <CaretRightIcon weight="bold" className="h-3 w-3 shrink-0 text-muted-foreground/30 mt-1 opacity-0 group-hover:opacity-100 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
