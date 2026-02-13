import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { NoteEditorDialog } from "./note-editor-dialog";
import { createMockNote } from "@/test/helpers/mock-data";

const mockSaveNote = vi.fn();
const mockRemoveNote = vi.fn();

vi.mock("@/presentation/hooks/use-notes", () => ({
  useNotes: () => ({
    notes: [],
    saveNote: mockSaveNote,
    removeNote: mockRemoveNote,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Mock HTMLDialogElement methods for happy-dom
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal || vi.fn();
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close || vi.fn();
});

describe("NoteEditorDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    verseKey: "1:1",
    surahId: 1,
  };

  it("renders dialog with verse reference", () => {
    render(<NoteEditorDialog {...defaultProps} />);
    expect(screen.getByText("Add Note")).toBeInTheDocument();
    expect(screen.getByText(/Al-Fatihah/)).toBeInTheDocument();
  });

  it("shows Edit Note title when editing", () => {
    const existingNote = createMockNote();
    render(
      <NoteEditorDialog {...defaultProps} existingNote={existingNote} />,
    );
    expect(screen.getByText("Edit Note")).toBeInTheDocument();
  });

  it("renders rich text editor with toolbar", async () => {
    render(<NoteEditorDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
    expect(screen.getByTitle("Bold")).toBeInTheDocument();
    expect(screen.getByTitle("Italic")).toBeInTheDocument();
  });

  it("loads existing note content into editor", async () => {
    const existingNote = createMockNote({ content: "My existing note" });
    render(
      <NoteEditorDialog {...defaultProps} existingNote={existingNote} />,
    );
    await waitFor(() => {
      expect(screen.getByText("My existing note")).toBeInTheDocument();
    });
  });

  it("adds tags on Enter", async () => {
    const user = userEvent.setup();
    render(<NoteEditorDialog {...defaultProps} />);
    const tagInput = screen.getByLabelText("Tag input");
    await user.type(tagInput, "reflection{Enter}");
    expect(screen.getByText("reflection")).toBeInTheDocument();
  });

  it("removes tags when X is clicked", async () => {
    const user = userEvent.setup();
    render(<NoteEditorDialog {...defaultProps} />);
    const tagInput = screen.getByLabelText("Tag input");
    await user.type(tagInput, "test{Enter}");
    expect(screen.getByText("test")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove tag test"));
    expect(screen.queryByText("test")).not.toBeInTheDocument();
  });

  it("calls saveNote with contentJson on save", async () => {
    const user = userEvent.setup();
    const existingNote = createMockNote({ content: "Saveable content" });
    render(
      <NoteEditorDialog {...defaultProps} existingNote={existingNote} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Saveable content")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Save"));

    expect(mockSaveNote).toHaveBeenCalledWith(
      expect.objectContaining({
        verseKey: "1:1",
        surahId: 1,
        content: expect.any(String),
        contentJson: expect.any(String),
      }),
    );
  });

  it("shows delete button only when editing", () => {
    const { rerender } = render(<NoteEditorDialog {...defaultProps} />);
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();

    rerender(
      <NoteEditorDialog
        {...defaultProps}
        existingNote={createMockNote()}
      />,
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls removeNote on delete", async () => {
    const user = userEvent.setup();
    const existingNote = createMockNote({ id: "note-42" });
    render(
      <NoteEditorDialog {...defaultProps} existingNote={existingNote} />,
    );
    await user.click(screen.getByText("Delete"));
    expect(mockRemoveNote).toHaveBeenCalledWith("note-42");
  });

  it("loads contentJson when available over plain text", async () => {
    const contentJson = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Rich text note" }],
        },
      ],
    });
    const existingNote = createMockNote({
      content: "Plain text fallback",
      contentJson,
    });
    render(
      <NoteEditorDialog {...defaultProps} existingNote={existingNote} />,
    );
    await waitFor(() => {
      expect(screen.getByText("Rich text note")).toBeInTheDocument();
    });
  });
});
