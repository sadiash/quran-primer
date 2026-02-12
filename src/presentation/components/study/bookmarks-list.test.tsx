import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { BookmarksList } from "./bookmarks-list";
import { createMockBookmark } from "@/test/helpers/mock-data";

const mockRemoveBookmark = vi.fn();

vi.mock("@/presentation/hooks/use-bookmarks", () => ({
  useBookmarks: () => ({
    bookmarks: mockBookmarks,
    isBookmarked: () => false,
    toggleBookmark: vi.fn(),
    removeBookmark: mockRemoveBookmark,
  }),
}));

let mockBookmarks: ReturnType<typeof createMockBookmark>[] = [];

describe("BookmarksList", () => {
  it("shows empty state when no bookmarks", () => {
    mockBookmarks = [];
    render(<BookmarksList />);
    expect(screen.getByText("No bookmarks yet.")).toBeInTheDocument();
  });

  it("renders bookmark items", () => {
    mockBookmarks = [
      createMockBookmark({ id: "1", verseKey: "1:1", surahId: 1 }),
      createMockBookmark({ id: "2", verseKey: "2:255", surahId: 2 }),
    ];
    render(<BookmarksList />);
    expect(screen.getByText(/Al-Fatihah/)).toBeInTheDocument();
    expect(screen.getByText(/Al-Baqarah/)).toBeInTheDocument();
  });

  it("links to surah page with verse anchor", () => {
    mockBookmarks = [
      createMockBookmark({ id: "1", verseKey: "2:255", surahId: 2 }),
    ];
    render(<BookmarksList />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/surahs/2#verse-2:255");
  });

  it("renders remove buttons", () => {
    mockBookmarks = [
      createMockBookmark({ id: "1", verseKey: "1:1", surahId: 1 }),
    ];
    render(<BookmarksList />);
    expect(screen.getByLabelText("Remove bookmark")).toBeInTheDocument();
  });
});
