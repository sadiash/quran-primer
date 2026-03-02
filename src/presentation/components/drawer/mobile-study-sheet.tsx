"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import { usePanels } from "@/presentation/providers/panel-provider";
import { TafsirSection } from "./tafsir-section";
import { HadithSection } from "./hadith-section";
import { AiSection } from "./ai-section";
import { SourcesSection } from "./sources-section";
import { NotesSection } from "./notes-section";
import { SectionHeader } from "./section-header";
import { ArrowSquareOutIcon, BookBookmarkIcon, BookOpenIcon, NoteIcon, RobotIcon } from "@phosphor-icons/react";

function useIsMobileOrTablet() {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setMatch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return match;
}

/**
 * Mobile/tablet study sheet — bottom drawer using vaul.
 * All sections stacked vertically and scrollable.
 * Renders on mobile and tablet (<lg breakpoint).
 * On desktop (lg+), PanelLayout handles docked panels instead.
 */
export function MobileStudySheet() {
  const isMobileOrTablet = useIsMobileOrTablet();
  const { openPanels, closeAllPanels } = usePanels();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOpen = isMobileOrTablet && openPanels.size > 0;

  // Determine which section to scroll to (most recently opened)
  const firstOpen = useMemo(() => {
    const ordered = ["tafsir", "hadith", "notes", "ai", "sources"] as const;
    return ordered.find((id) => openPanels.has(id)) ?? null;
  }, [openPanels]);

  useEffect(() => {
    if (!isOpen || !firstOpen || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-section="${firstOpen}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isOpen, firstOpen]);

  // Don't render vaul at all on desktop — it hijacks pointer-events on <html>
  if (!isMobileOrTablet) return null;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeAllPanels();
      }}
      snapPoints={[0.3, 0.85]}
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col border-t border-border bg-background shadow-lg">
          {/* Drag handle */}
          <div className="flex justify-center py-2">
            <div className="h-1 w-12 bg-border" />
          </div>

          {/* Visually hidden title for accessibility */}
          <Drawer.Title className="sr-only">Study Tools</Drawer.Title>

          {/* All sections stacked */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div data-section="tafsir">
              <SectionHeader icon={BookOpenIcon} title="Tafsir" />
              <TafsirSection />
            </div>
            <div data-section="hadith">
              <SectionHeader icon={BookBookmarkIcon} title="Hadith" />
              <HadithSection />
            </div>
            <div data-section="notes">
              <SectionHeader icon={NoteIcon} title="Notes" />
              <NotesSection />
            </div>
            <div data-section="ai">
              <SectionHeader icon={RobotIcon} title="AI" />
              <AiSection />
            </div>
            <div data-section="sources">
              <SectionHeader icon={ArrowSquareOutIcon} title="Sources" />
              <SourcesSection />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
