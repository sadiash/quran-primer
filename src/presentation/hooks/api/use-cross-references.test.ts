import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useCrossReferences } from "./use-cross-references";
import { createMockCrossScriptureCluster } from "@/test/helpers/mock-data";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  return () => {
    vi.restoreAllMocks();
  };
});

describe("useCrossReferences", () => {
  it("returns empty array when verseKey is null", () => {
    const { result } = renderHook(() => useCrossReferences(null), {
      wrapper: createWrapper(),
    });

    // Query is disabled, so data should be undefined
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches cross-references for a given verse key", async () => {
    const clusters = [createMockCrossScriptureCluster()];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: clusters })),
    );

    const { result } = renderHook(() => useCrossReferences("2:247"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(clusters);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/v1/cross-references?verse_key=2%3A247",
    );
  });

  it("handles API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, error: { message: "Server error" } }),
      ),
    );

    const { result } = renderHook(() => useCrossReferences("2:247"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
