"use client";

import { useState } from "react";
import { BookOpenIcon, BooksIcon } from "@phosphor-icons/react";
import type { Surah } from "@/core/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { SurahBrowser } from "@/presentation/components/quran/surah-browser";
import { HadithBrowser } from "@/presentation/components/hadith/hadith-browser";

type BrowseTab = "quran" | "hadith";

const TABS: { id: BrowseTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "quran", label: "Quran", icon: BookOpenIcon },
  { id: "hadith", label: "Hadith", icon: BooksIcon },
];

export function BrowsePageClient({ surahs }: { surahs: Surah[] }) {
  const [tab, setTab] = useState<BrowseTab>("quran");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={tab === "quran" ? "Browse Surahs" : "Browse Hadith"}
        subtitle={tab === "quran" ? "All 114 surahs of the Quran" : "Browse hadith collections"}
      />

      {/* Tab toggle */}
      <div className="mt-4 flex rounded-lg border border-border w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
                t.id === "quran" && "rounded-l-lg",
                t.id === "hadith" && "rounded-r-lg",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "quran" ? (
          <SurahBrowser surahs={surahs} />
        ) : (
          <HadithBrowser />
        )}
      </div>
    </div>
  );
}
