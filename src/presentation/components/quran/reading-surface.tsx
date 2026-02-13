"use client";

import { useMemo, useState, useCallback } from "react";
import type { Verse, Translation, TranslationLayout, Note } from "@/core/types";
import { useVerseVisibility } from "@/presentation/hooks/use-verse-visibility";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useNotes } from "@/presentation/hooks/use-notes";
import { useReadingTracker } from "@/presentation/hooks/use-reading-tracker";
import { NoteEditorDialog } from "@/presentation/components/study/note-editor-dialog";
import { Bismillah } from "./bismillah";
import { VerseLine } from "./verse-line";

interface ReadingSurfaceProps {
  surahId: number;
  verses: Verse[];
  translations: Translation[];
  showArabic?: boolean;
  translationLayout?: TranslationLayout;
}

export function ReadingSurface({
  surahId,
  verses,
  translations,
  showArabic = true,
  translationLayout = "stacked",
}: ReadingSurfaceProps) {
  const { observerRef, getCurrentVerseKey } = useVerseVisibility();
  const { bookmarks } = useBookmarks(surahId);
  const { notes } = useNotes({ surahId });

  useReadingTracker({
    surahId,
    totalVerses: verses.length,
    getCurrentVerseKey,
  });

  const [noteDialog, setNoteDialog] = useState<{
    verseKey: string;
    existingNote?: Note;
  } | null>(null);

  // Group translations by verseKey -> Translation[]
  const translationsByVerse = useMemo(() => {
    const map = new Map<string, Translation[]>();
    for (const t of translations) {
      const existing = map.get(t.verseKey);
      if (existing) {
        existing.push(t);
      } else {
        map.set(t.verseKey, [t]);
      }
    }
    return map;
  }, [translations]);

  const bookmarkedKeys = useMemo(() => {
    const set = new Set<string>();
    for (const b of bookmarks) {
      set.add(b.verseKey);
    }
    return set;
  }, [bookmarks]);

  const notesByVerse = useMemo(() => {
    const map = new Map<string, Note>();
    for (const n of notes) {
      map.set(n.verseKey, n);
    }
    return map;
  }, [notes]);

  const handleNoteClick = useCallback(
    (verseKey: string) => {
      const existing = notesByVerse.get(verseKey);
      setNoteDialog({ verseKey, existingNote: existing });
    },
    [notesByVerse],
  );

  const showBismillah = surahId !== 1 && surahId !== 9;

  return (
    <div>
      {showBismillah && <Bismillah />}

      <div>
        {verses.map((verse) => (
          <VerseLine
            key={verse.verseKey}
            verse={verse}
            surahId={surahId}
            translations={translationsByVerse.get(verse.verseKey) ?? []}
            observerRef={observerRef}
            isBookmarked={bookmarkedKeys.has(verse.verseKey)}
            hasNote={notesByVerse.has(verse.verseKey)}
            onNoteClick={() => handleNoteClick(verse.verseKey)}
            showArabic={showArabic}
            translationLayout={translationLayout}
          />
        ))}
      </div>

      {noteDialog && (
        <NoteEditorDialog
          open={!!noteDialog}
          onClose={() => setNoteDialog(null)}
          verseKey={noteDialog.verseKey}
          surahId={surahId}
          existingNote={noteDialog.existingNote}
        />
      )}
    </div>
  );
}
