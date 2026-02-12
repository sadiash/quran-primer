import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { db } from "@/infrastructure/db/client";
import { useProgress } from "./use-progress";

beforeEach(async () => {
  await db.progress.clear();
});

describe("useProgress", () => {
  it("returns undefined progress when no data", async () => {
    const { result } = renderHook(() => useProgress(1));
    await waitFor(() => {
      expect(result.current.progress).toBeUndefined();
    });
  });

  it("returns empty allProgress initially", async () => {
    const { result } = renderHook(() => useProgress());
    await waitFor(() => {
      expect(result.current.allProgress).toEqual([]);
    });
  });

  it("updateProgress saves and retrieves progress", async () => {
    const { result } = renderHook(() => useProgress(1));

    await act(async () => {
      await result.current.updateProgress({
        surahId: 1,
        lastVerseKey: "1:5",
        lastVerseNumber: 5,
        completedVerses: 5,
        totalVerses: 7,
        updatedAt: new Date(),
      });
    });

    await waitFor(() => {
      expect(result.current.progress).toBeDefined();
      expect(result.current.progress?.lastVerseKey).toBe("1:5");
      expect(result.current.progress?.completedVerses).toBe(5);
    });
  });

  it("allProgress returns all surah progress", async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.updateProgress({
        surahId: 1,
        lastVerseKey: "1:3",
        lastVerseNumber: 3,
        completedVerses: 3,
        totalVerses: 7,
        updatedAt: new Date("2025-01-01"),
      });
      await result.current.updateProgress({
        surahId: 2,
        lastVerseKey: "2:100",
        lastVerseNumber: 100,
        completedVerses: 100,
        totalVerses: 286,
        updatedAt: new Date("2025-01-02"),
      });
    });

    await waitFor(() => {
      expect(result.current.allProgress).toHaveLength(2);
    });
  });

  it("getLatestProgress returns most recent", async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.updateProgress({
        surahId: 1,
        lastVerseKey: "1:3",
        lastVerseNumber: 3,
        completedVerses: 3,
        totalVerses: 7,
        updatedAt: new Date("2025-01-01"),
      });
      await result.current.updateProgress({
        surahId: 2,
        lastVerseKey: "2:100",
        lastVerseNumber: 100,
        completedVerses: 100,
        totalVerses: 286,
        updatedAt: new Date("2025-01-02"),
      });
    });

    await waitFor(() => {
      const latest = result.current.getLatestProgress();
      expect(latest).toBeDefined();
      expect(latest?.surahId).toBe(2);
    });
  });
});
