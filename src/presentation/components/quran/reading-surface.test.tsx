import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { ReadingSurface } from "./reading-surface";
import { createMockVerse } from "@/test/helpers/mock-data";
import type { Translation } from "@/core/types";

vi.mock("@/presentation/hooks/use-bookmarks", () => ({
  useBookmarks: () => ({
    bookmarks: [],
    isBookmarked: () => false,
    toggleBookmark: vi.fn().mockResolvedValue(true),
    removeBookmark: vi.fn(),
  }),
}));

vi.mock("@/presentation/hooks/use-notes", () => ({
  useNotes: () => ({
    notes: [],
    saveNote: vi.fn(),
    removeNote: vi.fn(),
  }),
}));

vi.mock("@/presentation/hooks/use-reading-tracker", () => ({
  useReadingTracker: vi.fn(),
}));

const verses = [
  createMockVerse({ verseKey: "1:1", verseNumber: 1, textUthmani: "بِسْمِ ٱللَّهِ" }),
  createMockVerse({ verseKey: "1:2", verseNumber: 2, textUthmani: "ٱلْحَمْدُ لِلَّهِ" }),
];

const translations: Translation[] = [
  { id: 1, resourceId: 131, resourceName: "Sahih International", languageCode: "en", verseKey: "1:1", text: "In the name of God" },
  { id: 2, resourceId: 131, resourceName: "Sahih International", languageCode: "en", verseKey: "1:2", text: "All praise is due to God" },
];

beforeEach(() => {
  global.IntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  } as unknown as typeof IntersectionObserver) as unknown as typeof IntersectionObserver;

  vi.spyOn(window, "Audio").mockImplementation(
    vi.fn(function (this: Record<string, unknown>) {
      this.src = "";
      this.currentTime = 0;
      this.duration = 0;
      this.play = vi.fn().mockResolvedValue(undefined);
      this.pause = vi.fn();
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
    }) as unknown as () => HTMLAudioElement,
  );

  return () => {
    vi.restoreAllMocks();
  };
});

describe("ReadingSurface", () => {
  it("renders verses with translations", () => {
    render(
      <ReadingSurface surahId={1} verses={verses} translations={translations} />,
    );
    expect(screen.getByText("بِسْمِ ٱللَّهِ")).toBeInTheDocument();
    expect(screen.getByText("ٱلْحَمْدُ لِلَّهِ")).toBeInTheDocument();
    expect(screen.getByText("In the name of God")).toBeInTheDocument();
    expect(screen.getByText("All praise is due to God")).toBeInTheDocument();
  });

  it("hides bismillah for surah 1", () => {
    render(
      <ReadingSurface surahId={1} verses={verses} translations={[]} />,
    );
    expect(screen.queryByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).not.toBeInTheDocument();
  });

  it("hides bismillah for surah 9", () => {
    render(
      <ReadingSurface surahId={9} verses={verses} translations={[]} />,
    );
    expect(screen.queryByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).not.toBeInTheDocument();
  });

  it("shows bismillah for surah 2", () => {
    render(
      <ReadingSurface surahId={2} verses={verses} translations={[]} />,
    );
    expect(screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).toBeInTheDocument();
  });
});
