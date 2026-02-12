import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { VerseLine } from "./verse-line";
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

beforeEach(() => {
  global.IntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  } as unknown as typeof IntersectionObserver) as unknown as typeof IntersectionObserver;

  // Mock Audio element for AudioProvider
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

const mockObserverRef = { current: null as IntersectionObserver | null };

describe("VerseLine", () => {
  const verse = createMockVerse({
    verseKey: "2:255",
    verseNumber: 255,
    textUthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ",
  });

  const translation: Translation = {
    id: 1,
    resourceId: 131,
    resourceName: "Sahih International",
    languageCode: "en",
    verseKey: "2:255",
    text: "God - there is no deity except Him",
  };

  it("renders Arabic text", () => {
    render(
      <VerseLine verse={verse} surahId={2} observerRef={mockObserverRef} />,
    );
    expect(
      screen.getByText("ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ"),
    ).toBeInTheDocument();
  });

  it("renders verse ornament with Eastern Arabic numerals", () => {
    render(
      <VerseLine verse={verse} surahId={2} observerRef={mockObserverRef} />,
    );
    expect(screen.getByText("﴿٢٥٥﴾")).toBeInTheDocument();
  });

  it("renders translation when provided", () => {
    render(
      <VerseLine
        verse={verse}
        surahId={2}
        translation={translation}
        observerRef={mockObserverRef}
      />,
    );
    expect(
      screen.getByText("God - there is no deity except Him"),
    ).toBeInTheDocument();
  });

  it("has correct data attributes", () => {
    const { container } = render(
      <VerseLine verse={verse} surahId={2} observerRef={mockObserverRef} />,
    );
    const el = container.querySelector("[data-verse-key='2:255']");
    expect(el).toBeInTheDocument();
    expect(el?.id).toBe("verse-2:255");
  });

  it("renders play button in verse actions", () => {
    render(
      <VerseLine verse={verse} surahId={2} observerRef={mockObserverRef} />,
    );
    expect(screen.getByLabelText("Play verse")).toBeInTheDocument();
  });

  it("renders study link in verse actions", () => {
    render(
      <VerseLine verse={verse} surahId={2} observerRef={mockObserverRef} />,
    );
    expect(screen.getByLabelText("Study verse")).toBeInTheDocument();
  });
});
