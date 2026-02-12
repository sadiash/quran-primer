import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { VerseActions } from "./verse-actions";

const mockToggleBookmark = vi.fn().mockResolvedValue(true);

vi.mock("@/presentation/hooks/use-bookmarks", () => ({
  useBookmarks: () => ({
    bookmarks: [],
    isBookmarked: () => false,
    toggleBookmark: mockToggleBookmark,
    removeBookmark: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  global.IntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  } as unknown as typeof IntersectionObserver) as unknown as typeof IntersectionObserver;
});

describe("VerseActions", () => {
  it("renders bookmark button", () => {
    render(<VerseActions verseKey="1:1" surahId={1} />);
    expect(screen.getByLabelText("Bookmark verse")).toBeInTheDocument();
  });

  it("shows filled bookmark icon when bookmarked", () => {
    render(<VerseActions verseKey="1:1" surahId={1} isBookmarked />);
    expect(screen.getByLabelText("Remove bookmark")).toBeInTheDocument();
  });

  it("calls toggleBookmark on click", async () => {
    const user = userEvent.setup();
    render(<VerseActions verseKey="1:1" surahId={1} />);
    await user.click(screen.getByLabelText("Bookmark verse"));
    expect(mockToggleBookmark).toHaveBeenCalledWith("1:1", 1);
  });

  it("shows toast after bookmarking", async () => {
    const user = userEvent.setup();
    render(<VerseActions verseKey="1:1" surahId={1} />);
    await user.click(screen.getByLabelText("Bookmark verse"));
    expect(screen.getByText("Bookmark added")).toBeInTheDocument();
  });

  it("renders note button", () => {
    render(<VerseActions verseKey="1:1" surahId={1} />);
    expect(screen.getByLabelText("Add note")).toBeInTheDocument();
  });

  it("shows edit note label when hasNote", () => {
    render(<VerseActions verseKey="1:1" surahId={1} hasNote />);
    expect(screen.getByLabelText("Edit note")).toBeInTheDocument();
  });

  it("calls onNoteClick when note button clicked", async () => {
    const onNoteClick = vi.fn();
    const user = userEvent.setup();
    render(
      <VerseActions verseKey="1:1" surahId={1} onNoteClick={onNoteClick} />,
    );
    await user.click(screen.getByLabelText("Add note"));
    expect(onNoteClick).toHaveBeenCalledOnce();
  });

  it("does not have unconditional opacity-0 class", () => {
    const { container } = render(<VerseActions verseKey="1:1" surahId={1} />);
    const actionsDiv = container.firstChild as HTMLElement;
    const classes = actionsDiv.className.split(/\s+/);
    expect(classes).not.toContain("opacity-0");
  });
});
