import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { db } from "@/infrastructure/db/client";
import { useNotes } from "./use-notes";

beforeEach(async () => {
  await db.notes.clear();
});

describe("useNotes", () => {
  it("returns empty array initially", async () => {
    const { result } = renderHook(() => useNotes());
    await waitFor(() => {
      expect(result.current.notes).toEqual([]);
    });
  });

  it("saveNote creates a new note", async () => {
    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.saveNote({
        verseKey: "1:1",
        surahId: 1,
        content: "Test note",
        tags: ["reflection"],
      });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].content).toBe("Test note");
      expect(result.current.notes[0].tags).toEqual(["reflection"]);
    });
  });

  it("saveNote updates an existing note", async () => {
    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.saveNote({
        verseKey: "1:1",
        surahId: 1,
        content: "Original",
        tags: [],
      });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
    });

    const noteId = result.current.notes[0].id;

    await act(async () => {
      await result.current.saveNote({
        verseKey: "1:1",
        surahId: 1,
        content: "Updated",
        tags: ["new-tag"],
        id: noteId,
      });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].content).toBe("Updated");
    });
  });

  it("removeNote deletes a note", async () => {
    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.saveNote({
        verseKey: "1:1",
        surahId: 1,
        content: "To delete",
        tags: [],
      });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeNote(result.current.notes[0].id);
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(0);
    });
  });

  it("filters by verseKey", async () => {
    const { result: all } = renderHook(() => useNotes());

    await act(async () => {
      await all.current.saveNote({
        verseKey: "1:1",
        surahId: 1,
        content: "Note A",
        tags: [],
      });
      await all.current.saveNote({
        verseKey: "2:255",
        surahId: 2,
        content: "Note B",
        tags: [],
      });
    });

    const { result: filtered } = renderHook(() =>
      useNotes({ verseKey: "1:1" }),
    );

    await waitFor(() => {
      expect(filtered.current.notes).toHaveLength(1);
      expect(filtered.current.notes[0].content).toBe("Note A");
    });
  });

  it("filters by surahId", async () => {
    const { result: all } = renderHook(() => useNotes());

    await act(async () => {
      await all.current.saveNote({
        verseKey: "1:1",
        surahId: 1,
        content: "Note A",
        tags: [],
      });
      await all.current.saveNote({
        verseKey: "2:255",
        surahId: 2,
        content: "Note B",
        tags: [],
      });
    });

    const { result: filtered } = renderHook(() => useNotes({ surahId: 2 }));

    await waitFor(() => {
      expect(filtered.current.notes).toHaveLength(1);
      expect(filtered.current.notes[0].content).toBe("Note B");
    });
  });
});
