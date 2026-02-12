import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReadingTracker } from "./use-reading-tracker";

const mockUpdateProgress = vi.fn();

vi.mock("./use-progress", () => ({
  useProgress: () => ({
    progress: undefined,
    allProgress: [],
    updateProgress: mockUpdateProgress,
    getLatestProgress: () => undefined,
  }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useReadingTracker", () => {
  it("saves progress on interval", () => {
    const getCurrentVerseKey = vi.fn().mockReturnValue("1:3");

    renderHook(() =>
      useReadingTracker({
        surahId: 1,
        totalVerses: 7,
        getCurrentVerseKey,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockUpdateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        surahId: 1,
        lastVerseKey: "1:3",
        lastVerseNumber: 3,
        completedVerses: 3,
        totalVerses: 7,
      }),
    );
  });

  it("tracks max verse seen", () => {
    const getCurrentVerseKey = vi.fn().mockReturnValue("1:5");

    renderHook(() =>
      useReadingTracker({
        surahId: 1,
        totalVerses: 7,
        getCurrentVerseKey,
      }),
    );

    // First save at verse 5
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Scroll back to verse 2
    getCurrentVerseKey.mockReturnValue("1:2");
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // completedVerses should still be 5 (max)
    const lastCall = mockUpdateProgress.mock.calls.at(-1)?.[0];
    expect(lastCall.completedVerses).toBe(5);
    expect(lastCall.lastVerseKey).toBe("1:2");
  });

  it("does not save when no verse key", () => {
    const getCurrentVerseKey = vi.fn().mockReturnValue(null);

    renderHook(() =>
      useReadingTracker({
        surahId: 1,
        totalVerses: 7,
        getCurrentVerseKey,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockUpdateProgress).not.toHaveBeenCalled();
  });

  it("saves on unmount", () => {
    const getCurrentVerseKey = vi.fn().mockReturnValue("1:4");

    const { unmount } = renderHook(() =>
      useReadingTracker({
        surahId: 1,
        totalVerses: 7,
        getCurrentVerseKey,
      }),
    );

    unmount();

    expect(mockUpdateProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        surahId: 1,
        lastVerseKey: "1:4",
      }),
    );
  });
});
