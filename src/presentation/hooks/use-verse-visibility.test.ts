import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVerseVisibility } from "./use-verse-visibility";

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  global.IntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = mockObserve;
    this.unobserve = vi.fn();
    this.disconnect = mockDisconnect;
  } as unknown as typeof IntersectionObserver) as unknown as typeof IntersectionObserver;
});

describe("useVerseVisibility", () => {
  it("creates an intersection observer", () => {
    renderHook(() => useVerseVisibility());
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ rootMargin: "-20% 0px -60% 0px" }),
    );
  });

  it("returns getCurrentVerseKey function", () => {
    const { result } = renderHook(() => useVerseVisibility());
    expect(typeof result.current.getCurrentVerseKey).toBe("function");
    expect(result.current.getCurrentVerseKey()).toBeNull();
  });

  it("returns observerRef", () => {
    const { result } = renderHook(() => useVerseVisibility());
    expect(result.current.observerRef).toBeDefined();
  });
});
