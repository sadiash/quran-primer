import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { db } from "@/infrastructure/db/client";
import { usePreferences } from "./use-preferences";

beforeEach(async () => {
  await db.preferences.clear();
});

describe("usePreferences", () => {
  it("returns default preferences when none saved", async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => {
      expect(result.current.preferences).toBeDefined();
      expect(result.current.preferences.theme).toBe("system");
      expect(result.current.preferences.arabicFont).toBe("uthmani");
      expect(result.current.preferences.showTranslation).toBe(true);
    });
  });

  it("updatePreferences merges partial updates", async () => {
    const { result } = renderHook(() => usePreferences());

    await act(async () => {
      await result.current.updatePreferences({ theme: "dark" });
    });

    await waitFor(() => {
      expect(result.current.preferences.theme).toBe("dark");
      expect(result.current.preferences.arabicFont).toBe("uthmani");
    });
  });

  it("updatePreferences preserves existing values", async () => {
    const { result } = renderHook(() => usePreferences());

    await act(async () => {
      await result.current.updatePreferences({ theme: "dark" });
    });

    await act(async () => {
      await result.current.updatePreferences({ arabicFontSize: "xl" });
    });

    await waitFor(() => {
      expect(result.current.preferences.theme).toBe("dark");
      expect(result.current.preferences.arabicFontSize).toBe("xl");
    });
  });

  it("sets updatedAt on save", async () => {
    const { result } = renderHook(() => usePreferences());
    const before = new Date();

    await act(async () => {
      await result.current.updatePreferences({ theme: "light" });
    });

    await waitFor(() => {
      expect(result.current.preferences.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });
});
