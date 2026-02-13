"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Languages } from "lucide-react";
import { useWorkspace } from "@/presentation/providers";
import { useFetch } from "@/presentation/hooks/use-fetch";
import type { Translation } from "@/core/types";
import { cn } from "@/lib/utils";

const TRANSLATION_RESOURCES = [
  { id: 1001, name: "The Clear Quran", author: "Dr. Mustafa Khattab" },
  { id: 1002, name: "Yusuf Ali", author: "Abdullah Yusuf Ali" },
  { id: 1003, name: "Pickthall", author: "Muhammad Marmaduke Pickthall" },
  { id: 1004, name: "Muhsin Khan", author: "Muhammad Muhsin Khan" },
  { id: 1005, name: "Abdel Haleem", author: "M.A.S. Abdel Haleem" },
];

function sanitize(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["sup", "sub", "b", "i", "em", "strong", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

export function TranslationPanel() {
  const { state } = useWorkspace();
  const verseKey = state.focusedVerseKey;
  const [selectedIds, setSelectedIds] = useState<number[]>([1001, 1002]);

  const surahId = verseKey ? Number(verseKey.split(":")[0]) : null;
  const url = surahId ? `/api/v1/surahs/${surahId}?translation_ids=${selectedIds.join(",")}` : null;
  const fetchKey = `${verseKey}:${selectedIds.join(",")}`;
  const { data, error, isLoading } = useFetch<{ translations: Translation[] }>(url, fetchKey);

  const translations = useMemo(() => {
    if (!data?.translations || !verseKey) return [];
    return data.translations.filter((t) => t.verseKey === verseKey);
  }, [data, verseKey]);

  const toggleTranslation = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  };

  if (!verseKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
        <Languages className="h-8 w-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No verse selected</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Select a verse to compare translations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {TRANSLATION_RESOURCES.map((r) => (
          <button
            key={r.id}
            onClick={() => toggleTranslation(r.id)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-medium transition-fast",
              selectedIds.includes(r.id)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface-hover",
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Verse <span className="font-mono text-foreground">{verseKey}</span>
      </p>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && translations.length === 0 && (
        <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
          No translations found for this verse.
        </p>
      )}

      {!isLoading && !error && translations.length > 0 && (
        <div className="space-y-3">
          {translations.map((t) => (
            <TranslationCard key={`${t.resourceId}-${t.verseKey}`} translation={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TranslationCard({ translation }: { translation: Translation }) {
  const html = useMemo(() => sanitize(translation.text), [translation.text]);
  const hasHtml = /<[^>]+>/.test(translation.text);
  const resource = TRANSLATION_RESOURCES.find((r) => r.id === translation.resourceId);

  return (
    <div className="rounded-lg border border-border/50 bg-surface/50 p-3 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium text-primary uppercase tracking-wider">
          {translation.resourceName}
        </p>
        {resource && (
          <p className="text-[10px] text-muted-foreground">{resource.author}</p>
        )}
      </div>
      {hasHtml ? (
        <p
          className="text-sm leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-sm leading-relaxed text-foreground">
          {translation.text}
        </p>
      )}
    </div>
  );
}
