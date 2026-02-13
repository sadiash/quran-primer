import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStudyNavigation } from "./use-study-navigation";
import type { BreadcrumbItem } from "./use-study-navigation";

const makeItem = (
  id: string,
  type: BreadcrumbItem["type"] = "verse",
  label?: string,
): BreadcrumbItem => ({
  id,
  label: label ?? `Item ${id}`,
  type,
  verseKey: type === "verse" ? id : undefined,
});

describe("useStudyNavigation", () => {
  it("starts with empty items", () => {
    const { result } = renderHook(() => useStudyNavigation());

    expect(result.current.items).toEqual([]);
    expect(result.current.depth).toBe(0);
    expect(result.current.current).toBeNull();
  });

  describe("push", () => {
    it("adds items to the breadcrumb trail", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.depth).toBe(1);
      expect(result.current.current?.id).toBe("1:1");
    });

    it("pushes multiple items", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
      });
      act(() => {
        result.current.push(makeItem("tafsir-1", "tafsir", "Tafsir Ibn Kathir"));
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.depth).toBe(2);
      expect(result.current.current?.id).toBe("tafsir-1");
    });

    it("prevents duplicate consecutive pushes", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
      });
      act(() => {
        result.current.push(makeItem("1:1"));
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("pop", () => {
    it("removes the last item", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
        result.current.push(makeItem("1:2"));
      });
      act(() => {
        result.current.pop();
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.current?.id).toBe("1:1");
    });

    it("does nothing when empty", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.pop();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("goTo", () => {
    it("navigates to a specific index", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
        result.current.push(makeItem("tafsir-1", "tafsir"));
        result.current.push(makeItem("hadith-1", "hadith"));
      });

      act(() => {
        result.current.goTo(0);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.current?.id).toBe("1:1");
    });

    it("does nothing for out-of-bounds index", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
      });
      act(() => {
        result.current.goTo(5);
      });

      expect(result.current.items).toHaveLength(1);
    });

    it("does nothing for negative index", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
      });
      act(() => {
        result.current.goTo(-1);
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("clear", () => {
    it("removes all items", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
        result.current.push(makeItem("1:2"));
        result.current.push(makeItem("1:3"));
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.depth).toBe(0);
      expect(result.current.current).toBeNull();
    });
  });

  describe("current", () => {
    it("returns the last item", () => {
      const { result } = renderHook(() => useStudyNavigation());

      act(() => {
        result.current.push(makeItem("1:1"));
        result.current.push(makeItem("1:2"));
      });

      expect(result.current.current?.id).toBe("1:2");
    });

    it("returns null when empty", () => {
      const { result } = renderHook(() => useStudyNavigation());

      expect(result.current.current).toBeNull();
    });
  });
});
