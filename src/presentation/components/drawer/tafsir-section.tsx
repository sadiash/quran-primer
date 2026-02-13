"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Loader2, Copy, Check, BookOpen } from "lucide-react";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { usePanels } from "@/presentation/providers/panel-provider";
import type { Tafsir } from "@/core/types";
import { cn } from "@/lib/utils";

const TAFSIR_RESOURCES = [
  { id: 74, name: "Al-Jalalayn", authorName: "Jalal ad-Din al-Mahalli & as-Suyuti" },
  { id: 169, name: "Ibn Kathir (Abridged)", authorName: "Ibn Kathir" },
] as const;

function sanitize(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "span", "sup", "sub", "h3", "h4", "ul", "ol", "li", "blockquote"],
    ALLOWED_ATTR: ["class"],
  });
}

export function TafsirSection() {
  const { focusedVerseKey } = usePanels();
  const [activeTafsirIds, setActiveTafsirIds] = useState<number[]>([TAFSIR_RESOURCES[0].id]);

  if (!focusedVerseKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-muted-foreground/70">
        <BookOpen className="h-4 w-4 shrink-0" />
        <p className="text-xs">Click on a verse to view its tafsir</p>
      </div>
    );
  }

  const toggleTafsir = (id: number) => {
    setActiveTafsirIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev
        : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Scholar selector */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Verse <span className="font-mono text-foreground">{focusedVerseKey}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {TAFSIR_RESOURCES.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleTafsir(r.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] font-medium transition-fast",
                activeTafsirIds.includes(r.id)
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-surface-hover",
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tafsir content */}
      <div className="space-y-4">
        {activeTafsirIds.map((tafsirId) => (
          <TafsirContent
            key={tafsirId}
            tafsirId={tafsirId}
            verseKey={focusedVerseKey}
            showHeader={activeTafsirIds.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

function TafsirContent({
  tafsirId,
  verseKey,
  showHeader,
}: {
  tafsirId: number;
  verseKey: string;
  showHeader: boolean;
}) {
  const url = `/api/v1/tafsir?verse_key=${verseKey}&tafsir_id=${tafsirId}`;
  const fetchKey = `${verseKey}:${tafsirId}`;
  const { data: tafsir, error, isLoading } = useFetch<Tafsir>(url, fetchKey);
  const [copied, setCopied] = useState(false);

  const resource = TAFSIR_RESOURCES.find((r) => r.id === tafsirId);
  const tafsirText = tafsir?.text ?? "";
  const sanitizedHtml = useMemo(
    () => (tafsirText ? sanitize(tafsirText) : ""),
    [tafsirText],
  );

  const handleCopy = async () => {
    if (!tafsir) return;
    const plain = tafsir.text.replace(/<[^>]+>/g, "");
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(showHeader && "rounded-lg border border-border/30 p-3")}>
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-foreground">{resource?.name}</p>
            <p className="text-[10px] text-muted-foreground">{resource?.authorName}</p>
          </div>
          {tafsir && (
            <button
              onClick={handleCopy}
              className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover"
              aria-label="Copy tafsir text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}

      {!showHeader && tafsir && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover"
            aria-label="Copy tafsir text"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && tafsir && (
        <div
          className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground [&_b]:text-foreground [&_strong]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      )}

      {!isLoading && !error && !tafsir && (
        <p className="text-xs text-muted-foreground/70 italic">
          No tafsir available for this verse.
        </p>
      )}
    </div>
  );
}
