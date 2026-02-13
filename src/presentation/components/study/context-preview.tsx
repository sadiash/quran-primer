"use client";

import {
  BookOpen,
  BookText,
  GitBranch,
  StickyNote,
  Bookmark,
  Play,
  ArrowRight,
} from "lucide-react";
import { useVerseContext } from "@/presentation/hooks/use-verse-context";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import { usePanelInstanceContext } from "@/presentation/providers/panel-instance-context";
import { useTafsir } from "@/presentation/hooks/api";
import { useHadith } from "@/presentation/hooks/api";
import { useCrossReferences } from "@/presentation/hooks/api/use-cross-references";
import { useNotes } from "@/presentation/hooks/use-notes";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { Skeleton } from "@/presentation/components/ui";
import type { PanelKind } from "@/core/types/workspace";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSurahId(verseKey: string): number {
  const [surahStr] = verseKey.split(":");
  return Number(surahStr) || 1;
}

function truncateHtml(html: string, maxLength: number): string {
  const text = html.replace(/<[^>]*>/g, "");
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DEFAULT_TAFSIR_ID = 169;

export function ContextPreview() {
  const verseKey = useVerseContext();
  const ws = useWorkspace();
  const panelInstance = usePanelInstanceContext();

  // Fetch summary data
  const { data: tafsir, isLoading: tafsirLoading } = useTafsir(
    verseKey,
    DEFAULT_TAFSIR_ID,
  );
  const { data: hadiths = [], isLoading: hadithLoading } = useHadith(
    verseKey ?? "",
  );
  const { data: crossRefs = [], isLoading: crossRefLoading } =
    useCrossReferences(verseKey);

  const surahId = verseKey ? parseSurahId(verseKey) : 1;
  const { notes } = useNotes({ verseKey: verseKey ?? undefined });
  const { isBookmarked, toggleBookmark } = useBookmarks(surahId);
  const audio = useAudioPlayer();

  if (!verseKey) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
        <BookOpen className="h-10 w-10 opacity-40" />
        <p className="text-sm">Select a verse to see an overview</p>
      </div>
    );
  }

  const navigateToPanel = (kind: PanelKind) => {
    if (panelInstance) {
      // Close context preview and open the requested panel
      ws.closePanel(panelInstance.id);
      ws.addPanel(kind);
    } else {
      // Legacy fallback — just add the panel
      ws.addPanel(kind);
    }
  };

  const handleBookmark = async () => {
    await toggleBookmark(verseKey, surahId);
  };

  const handlePlay = () => {
    const isThisPlaying =
      audio.currentVerseKey === verseKey && audio.isPlaying;
    if (isThisPlaying) {
      audio.pause();
    } else {
      audio.play(verseKey, surahId);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Verse {verseKey}
      </h3>

      {/* Tafsir summary */}
      <PreviewSection
        icon={BookOpen}
        title="Tafsir"
        isLoading={tafsirLoading}
        onClick={() => navigateToPanel("tafsir")}
      >
        {tafsir ? (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncateHtml(tafsir.text, 200)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70">
            No tafsir available
          </p>
        )}
      </PreviewSection>

      {/* Hadith count */}
      <PreviewSection
        icon={BookText}
        title="Hadith"
        isLoading={hadithLoading}
        onClick={() => navigateToPanel("hadith")}
      >
        <p className="text-sm text-muted-foreground">
          {hadiths.length > 0
            ? `${hadiths.length} related hadith found`
            : "No related hadith found"}
        </p>
      </PreviewSection>

      {/* Cross-references count */}
      <PreviewSection
        icon={GitBranch}
        title="Cross-References"
        isLoading={crossRefLoading}
        onClick={() => navigateToPanel("crossref")}
      >
        <p className="text-sm text-muted-foreground">
          {crossRefs.length > 0
            ? `${crossRefs.length} cross-scripture cluster${crossRefs.length !== 1 ? "s" : ""} found`
            : "No cross-references found"}
        </p>
      </PreviewSection>

      {/* Notes preview */}
      <PreviewSection
        icon={StickyNote}
        title="Notes"
        onClick={() => navigateToPanel("notes")}
      >
        {notes.length > 0 ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notes[0]!.content.slice(0, 100)}
            {notes.length > 1 && ` (+${notes.length - 1} more)`}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70">No notes yet</p>
        )}
      </PreviewSection>

      {/* Quick actions */}
      <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={handleBookmark}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-fast hover:bg-muted/50 hover:text-foreground"
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${isBookmarked(verseKey) ? "fill-primary text-primary" : ""}`}
          />
          {isBookmarked(verseKey) ? "Bookmarked" : "Bookmark"}
        </button>
        <button
          type="button"
          onClick={() => navigateToPanel("notes")}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-fast hover:bg-muted/50 hover:text-foreground"
        >
          <StickyNote className="h-3.5 w-3.5" />
          Note
        </button>
        <button
          type="button"
          onClick={handlePlay}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-fast hover:bg-muted/50 hover:text-foreground"
        >
          <Play className="h-3.5 w-3.5" />
          Play
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview Section
// ---------------------------------------------------------------------------

interface PreviewSectionProps {
  icon: typeof BookOpen;
  title: string;
  isLoading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function PreviewSection({
  icon: Icon,
  title,
  isLoading,
  onClick,
  children,
}: PreviewSectionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/section flex flex-col gap-1.5 rounded-lg border border-border p-3 text-left transition-fast hover:border-primary/30 hover:bg-muted/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{title}</span>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground/50 transition-fast group-hover/section:text-primary group-hover/section:translate-x-0.5" />
      </div>
      {isLoading ? (
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
