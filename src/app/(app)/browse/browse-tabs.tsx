import { BooksIcon, BookBookmarkIcon, GraphIcon } from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type BrowseTab = "quran" | "hadith" | "concepts";

const TABS: { id: BrowseTab; label: string; icon: React.ComponentType<{ className?: string; weight?: IconWeight }> }[] = [
  { id: "quran", label: "Quran", icon: BooksIcon },
  { id: "hadith", label: "Hadith", icon: BookBookmarkIcon },
  { id: "concepts", label: "Concepts", icon: GraphIcon },
];

export function BrowseTabs({
  active,
  onChange,
}: {
  active: BrowseTab;
  onChange: (tab: BrowseTab) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] border transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground",
            )}
          >
            <t.icon weight={isActive ? "fill" : ("bold" as IconWeight)} className="h-3 w-3" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
