"use client";

import { lazy, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Surah } from "@/core/types";
import { SurahBrowserBrutalist } from "@/presentation/components/quran/surah-browser-brutalist";
import { HadithBrowser } from "@/presentation/components/hadith/hadith-browser";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useSessionState } from "@/presentation/hooks/use-session-state";
import type { BrowseTab } from "./browse-tabs";

const OntologyBrowser = lazy(() =>
  import("@/presentation/components/browse/ontology-browser").then((m) => ({
    default: m.OntologyBrowser,
  })),
);

export function BrowsePageClient({ surahs }: { surahs: Surah[] }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useSessionState<BrowseTab>("browse:tab", "quran");

  // URL ?tab= param takes priority (e.g. from "Go back to Concepts" fallback link)
  useEffect(() => {
    if (tabParam === "hadith" || tabParam === "concepts") {
      setTab(tabParam);
    }
  }, [tabParam, setTab]);

  return (
    <div className="min-h-full bg-background text-foreground">
      {tab === "quran" && <SurahBrowserBrutalist surahs={surahs} activeTab={tab} onTabChange={setTab} />}
      {tab === "hadith" && <HadithBrowser activeTab={tab} onTabChange={setTab} />}
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
          <OntologyBrowser activeTab={tab} onTabChange={setTab} />
        </Suspense>
      )}
    </div>
  );
}
