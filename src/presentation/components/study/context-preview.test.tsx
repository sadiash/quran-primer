import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import { ContextPreview } from "./context-preview";
import { usePanelManager } from "@/presentation/providers/panel-provider";

beforeEach(() => {
  vi.spyOn(window, "Audio").mockImplementation(
    vi.fn(function (this: Record<string, unknown>) {
      this.src = "";
      this.currentTime = 0;
      this.duration = 0;
      this.play = vi.fn().mockResolvedValue(undefined);
      this.pause = vi.fn();
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
    }) as unknown as () => HTMLAudioElement,
  );

  return () => {
    vi.restoreAllMocks();
  };
});

/** Helper that focuses a verse via useEffect */
function ContextPreviewWithFocus({ verseKey }: { verseKey: string }) {
  const { focusVerse } = usePanelManager();
  useEffect(() => {
    focusVerse(verseKey);
  }, [verseKey, focusVerse]);
  return <ContextPreview />;
}

describe("ContextPreview", () => {
  it("renders empty state when no verse focused", () => {
    render(<ContextPreview />);
    expect(
      screen.getByText("Select a verse to see an overview"),
    ).toBeInTheDocument();
  });

  it("renders verse heading when focused", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<ContextPreviewWithFocus verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("Verse 1:1")).toBeInTheDocument();
    });
  });

  it("renders section titles", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<ContextPreviewWithFocus verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("Tafsir")).toBeInTheDocument();
    });

    expect(screen.getByText("Hadith")).toBeInTheDocument();
    expect(screen.getByText("Cross-References")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("renders quick action buttons", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<ContextPreviewWithFocus verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("Bookmark")).toBeInTheDocument();
    });

    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Play")).toBeInTheDocument();
  });
});
