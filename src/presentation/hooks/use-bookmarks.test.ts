import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { db } from "@/infrastructure/db/client";
import { useBookmarks } from "./use-bookmarks";

beforeEach(async () => {
  await db.bookmarks.clear();
});

describe("useBookmarks", () => {
  it("returns empty array initially", async () => {
    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => {
      expect(result.current.bookmarks).toEqual([]);
    });
  });

  it("toggleBookmark adds a bookmark", async () => {
    const { result } = renderHook(() => useBookmarks());

    await act(async () => {
      const added = await result.current.toggleBookmark("1:1", 1);
      expect(added).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.bookmarks).toHaveLength(1);
      expect(result.current.bookmarks[0]!.verseKey).toBe("1:1");
    });
  });

  it("toggleBookmark removes an existing bookmark", async () => {
    const { result } = renderHook(() => useBookmarks());

    await act(async () => {
      await result.current.toggleBookmark("1:1", 1);
    });

    await waitFor(() => {
      expect(result.current.bookmarks).toHaveLength(1);
    });

    await act(async () => {
      const removed = await result.current.toggleBookmark("1:1", 1);
      expect(removed).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.bookmarks).toHaveLength(0);
    });
  });

  it("isBookmarked returns correct status", async () => {
    const { result } = renderHook(() => useBookmarks());

    await act(async () => {
      await result.current.toggleBookmark("2:255", 2);
    });

    await waitFor(() => {
      expect(result.current.isBookmarked("2:255")).toBe(true);
      expect(result.current.isBookmarked("2:256")).toBe(false);
    });
  });

  it("filters by surahId when provided", async () => {
    const { result: all } = renderHook(() => useBookmarks());

    await act(async () => {
      await all.current.toggleBookmark("1:1", 1);
      await all.current.toggleBookmark("2:255", 2);
    });

    const { result: filtered } = renderHook(() => useBookmarks(1));

    await waitFor(() => {
      expect(filtered.current.bookmarks).toHaveLength(1);
      expect(filtered.current.bookmarks[0]!.verseKey).toBe("1:1");
    });
  });

  it("removeBookmark deletes a bookmark", async () => {
    const { result } = renderHook(() => useBookmarks());

    await act(async () => {
      await result.current.toggleBookmark("1:1", 1);
    });

    await waitFor(() => {
      expect(result.current.bookmarks).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeBookmark(result.current.bookmarks[0]!.id);
    });

    await waitFor(() => {
      expect(result.current.bookmarks).toHaveLength(0);
    });
  });
});
