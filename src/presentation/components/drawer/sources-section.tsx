"use client";

import { ExternalLink, BookOpen, Youtube, FileText, ChevronRight } from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { cn } from "@/lib/utils";
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

const LECTURES: { title: string; speaker: string; duration: string; source: string }[] = [
  { title: "Deeper Look at the Opening Verses", speaker: "Nouman Ali Khan", duration: "24 min", source: "Bayyinah" },
  { title: "Tafsir Series — Themes of Guidance", speaker: "Dr. Yasir Qadhi", duration: "45 min", source: "YouTube" },
  { title: "Linguistic Miracles in This Passage", speaker: "Nouman Ali Khan", duration: "18 min", source: "Bayyinah" },
];

export function SourcesSection() {
  const { focusedVerseKey } = usePanels();

  if (!focusedVerseKey) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <ExternalLink className="h-6 w-6 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/60">
          Select a verse to see cross-references and lectures
        </p>
      </div>
    );
  }

  const surahId = focusedVerseKey.split(":")[0] ?? "1";
  const refs = CROSS_REFS[surahId] ?? CROSS_REFS["2"]!;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Breadcrumb */}
      <PanelBreadcrumb items={[
        { label: `Verse ${focusedVerseKey}` },
        { label: "Sources" },
      ]} />

      {/* Cross-references */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60" />
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Cross-References
          </h3>
        </div>
        <div className="space-y-1">
          {refs.map((ref) => (
            <button
              key={ref.verse}
              className="group flex w-full items-start gap-2 rounded-lg p-2 text-left transition-fast hover:bg-surface-hover"
            >
              <span className="shrink-0 text-[11px] font-mono text-primary/70 mt-0.5">
                {ref.verse}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {ref.text}
                </p>
                <span className="inline-flex items-center mt-0.5 rounded-full bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/60">
                  {ref.theme}
                </span>
              </div>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30 mt-1 opacity-0 group-hover:opacity-100 transition-fast" />
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Lectures */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Youtube className="h-3.5 w-3.5 text-muted-foreground/60" />
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Lectures & Talks
          </h3>
        </div>
        <div className="space-y-1">
          {LECTURES.map((lecture) => (
            <button
              key={lecture.title}
              className="group flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-fast hover:bg-surface-hover"
            >
              {/* Thumbnail placeholder */}
              <div className="shrink-0 flex h-9 w-14 items-center justify-center rounded bg-muted/60">
                <Youtube className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/80 leading-snug line-clamp-1">
                  {lecture.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground/60">{lecture.speaker}</span>
                  <span className="text-[10px] text-muted-foreground/30">·</span>
                  <span className="text-[10px] text-muted-foreground/50">{lecture.duration}</span>
                  <span className="text-[10px] text-muted-foreground/30">·</span>
                  <span className="text-[10px] text-muted-foreground/50">{lecture.source}</span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/30 mt-1 opacity-0 group-hover:opacity-100 transition-fast" />
            </button>
          ))}
        </div>
      </div>

      {/* Related reading */}
      <div className="h-px bg-border/50" />
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Articles
          </h3>
        </div>
        <div className="space-y-1">
          <SourceLink title="The Central Theme of Surah Al-Baqarah" source="islamicstudies.info" />
          <SourceLink title="Historical Context of the Early Medinan Period" source="quran.com/learn" />
        </div>
      </div>
    </div>
  );
}

function SourceLink({ title, source }: { title: string; source: string }) {
  return (
    <button className="group flex w-full items-center gap-2 rounded-lg p-2 text-left transition-fast hover:bg-surface-hover">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground/80 leading-snug">{title}</p>
        <p className="text-[10px] text-muted-foreground/50">{source}</p>
      </div>
      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-fast" />
    </button>
  );
}
