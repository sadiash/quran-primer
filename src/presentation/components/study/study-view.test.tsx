import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import { StudyView } from "./study-view";
import { createMockVerse, createMockSurah } from "@/test/helpers/mock-data";

beforeEach(() => {
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

  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ ok: true, data: [] })),
  );

  return () => {
    vi.restoreAllMocks();
  };
});

describe("StudyView", () => {
  const verse = createMockVerse({
    verseKey: "2:255",
    verseNumber: 255,
    textUthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ",
  });
  const surah = createMockSurah({ id: 2, nameSimple: "Al-Baqarah" });

  it("renders verse Arabic text", () => {
    render(<StudyView verse={verse} surah={surah} />);
    expect(
      screen.getByText("ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ"),
    ).toBeInTheDocument();
  });

  it("renders surah name and verse number", () => {
    render(<StudyView verse={verse} surah={surah} />);
    expect(screen.getByText(/Al-Baqarah/)).toBeInTheDocument();
    expect(screen.getByText(/Verse 255/)).toBeInTheDocument();
  });

  it("renders tafsir panel with verse key", async () => {
    render(<StudyView verse={verse} surah={surah} />);
    await waitFor(() => {
      expect(screen.getByText("Tafsir for 2:255")).toBeInTheDocument();
    });
  });

  it("renders hadith panel with verse key", async () => {
    render(<StudyView verse={verse} surah={surah} />);
    await waitFor(() => {
      expect(screen.getByText("Related Hadith for 2:255")).toBeInTheDocument();
    });
  });

  it("renders play button", () => {
    render(<StudyView verse={verse} surah={surah} />);
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });
});
