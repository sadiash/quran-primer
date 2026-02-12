import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { SurahCard } from "./surah-card";
import { createMockSurah } from "@/test/helpers/mock-data";
import type { Surah, ReadingProgress } from "@/core/types";

const surah: Surah = createMockSurah({
  id: 2,
  nameSimple: "Al-Baqarah",
  nameArabic: "البقرة",
  nameTranslation: "The Cow",
  revelationType: "madinah",
  versesCount: 286,
});

describe("SurahCard", () => {
  it("renders surah details", () => {
    render(<SurahCard surah={surah} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("البقرة")).toBeInTheDocument();
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText("The Cow")).toBeInTheDocument();
    expect(screen.getByText("madinah")).toBeInTheDocument();
    expect(screen.getByText("286 verses")).toBeInTheDocument();
  });

  it("links to the surah page", () => {
    render(<SurahCard surah={surah} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/surahs/2");
  });

  it("renders progress bar when progress is provided", () => {
    const progress: ReadingProgress = {
      surahId: 2,
      lastVerseKey: "2:143",
      lastVerseNumber: 143,
      completedVerses: 143,
      totalVerses: 286,
      updatedAt: new Date(),
    };
    render(<SurahCard surah={surah} progress={progress} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("does not render progress bar when no progress", () => {
    render(<SurahCard surah={surah} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
