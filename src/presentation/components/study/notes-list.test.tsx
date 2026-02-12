import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { NotesList } from "./notes-list";
import { createMockNote } from "@/test/helpers/mock-data";
import type { Note } from "@/core/types";

let mockNotes: Note[] = [];

vi.mock("@/presentation/hooks/use-notes", () => ({
  useNotes: () => ({
    notes: mockNotes,
    saveNote: vi.fn(),
    removeNote: vi.fn(),
  }),
}));

describe("NotesList", () => {
  it("shows empty state when no notes", () => {
    mockNotes = [];
    render(<NotesList />);
    expect(screen.getByText("No notes yet.")).toBeInTheDocument();
  });

  it("renders note items", () => {
    mockNotes = [
      createMockNote({ id: "1", verseKey: "1:1", content: "First note", surahId: 1 }),
      createMockNote({ id: "2", verseKey: "2:255", content: "Second note", surahId: 2 }),
    ];
    render(<NotesList />);
    expect(screen.getByText(/Al-Fatihah/)).toBeInTheDocument();
    expect(screen.getByText(/Al-Baqarah/)).toBeInTheDocument();
    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Second note")).toBeInTheDocument();
  });

  it("shows tags as badges", () => {
    mockNotes = [
      createMockNote({
        id: "1",
        verseKey: "1:1",
        content: "Tagged note",
        tags: ["reflection", "study"],
      }),
    ];
    render(<NotesList />);
    // Tags appear as both filter pills and badges on cards
    expect(screen.getAllByText("reflection").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("study").length).toBeGreaterThanOrEqual(1);
  });

  it("renders tag filter pills", () => {
    mockNotes = [
      createMockNote({
        id: "1",
        verseKey: "1:1",
        content: "Note with tag",
        tags: ["reflection"],
      }),
    ];
    render(<NotesList />);
    // "All" pill + "reflection" pill
    const buttons = screen.getAllByRole("button");
    const tagButton = buttons.find((b) => b.textContent === "reflection");
    expect(tagButton).toBeDefined();
  });
});
