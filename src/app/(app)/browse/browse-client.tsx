"use client";

import { useState, lazy, Suspense } from "react";
import type { Surah } from "@/core/types";
import { SurahBrowserBrutalist } from "@/presentation/components/quran/surah-browser-brutalist";
import { HadithBrowser } from "@/presentation/components/hadith/hadith-browser";
import { cn } from "@/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react";

const OntologyBrowser = lazy(() =>
  import("@/presentation/components/browse/ontology-browser").then((m) => ({
    default: m.OntologyBrowser,
  })),
);

type BrowseTab = "quran" | "hadith" | "concepts";

export function BrowsePageClient({ surahs }: { surahs: Surah[] }) {
  const [tab, setTab] = useState<BrowseTab>("quran");

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Tab toggle */}
      <div className="flex border-b border-border/20">
        {(
          [
            { id: "quran", label: "Quran" },
            { id: "hadith", label: "Hadith" },
            { id: "concepts", label: "Concepts" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase bg-transparent border-none cursor-pointer transition-colors",
              tab === t.id ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {tab === "quran" && <SurahBrowserBrutalist surahs={surahs} />}
      {tab === "hadith" && <HadithBrowser />}
      {tab === "concepts" && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-3 py-24">
              <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                Loading...
              </span>
            </div>
          }
        >
          <OntologyBrowser />
        </Suspense>
      )}
    </div>
  );
}
