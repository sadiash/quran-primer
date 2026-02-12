"use client";

import { useMemo } from "react";
import type { Verse, Translation } from "@/core/types";
import { useVerseVisibility } from "@/presentation/hooks/use-verse-visibility";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { Bismillah } from "./bismillah";
import { VerseLine } from "./verse-line";

interface ReadingSurfaceProps {
  surahId: number;
  verses: Verse[];
  translations: Translation[];
}

export function ReadingSurface({
  surahId,
  verses,
  translations,
}: ReadingSurfaceProps) {
  const { observerRef } = useVerseVisibility();
  const { bookmarks } = useBookmarks(surahId);

  const translationMap = useMemo(() => {
    const map = new Map<string, Translation>();
    for (const t of translations) {
      map.set(t.verseKey, t);
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
            translation={translationMap.get(verse.verseKey)}
            observerRef={observerRef}
            isBookmarked={bookmarkedKeys.has(verse.verseKey)}
          />
        ))}
      </div>
    </div>
  );
}
