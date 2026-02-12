import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { ContinueReadingCard } from "./continue-reading-card";

let mockLatestProgress: ReturnType<
  typeof import("@/presentation/hooks/use-progress").useProgress
>["progress"] = undefined;

vi.mock("@/presentation/hooks/use-progress", () => ({
  useProgress: () => ({
    progress: undefined,
    allProgress: mockLatestProgress ? [mockLatestProgress] : [],
    updateProgress: vi.fn(),
    getLatestProgress: () => mockLatestProgress ?? undefined,
  }),
}));

describe("ContinueReadingCard", () => {
  it("shows start reading when no progress", () => {
    mockLatestProgress = undefined;
    render(<ContinueReadingCard />);
    expect(screen.getByText("Start Reading")).toBeInTheDocument();
    expect(screen.getByText("Begin with Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/surahs/1");
  });

  it("shows continue reading with progress", () => {
    mockLatestProgress = {
      surahId: 2,
      lastVerseKey: "2:100",
      lastVerseNumber: 100,
      completedVerses: 100,
      totalVerses: 286,
      updatedAt: new Date(),
    };
    render(<ContinueReadingCard />);
    expect(screen.getByText("Continue Reading")).toBeInTheDocument();
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/surahs/2#verse-2:100",
    );
  });
});
