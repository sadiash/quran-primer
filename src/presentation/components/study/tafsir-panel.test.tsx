import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import { TafsirPanel } from "./tafsir-panel";
import { usePanelManager } from "@/presentation/providers/panel-provider";
import {
  createMockTafsir,
  createMockTafsirResource,
} from "@/test/helpers/mock-data";

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

/** Helper that focuses a verse via useEffect before rendering the panel */
function TafsirPanelWithFocus({ verseKey }: { verseKey: string }) {
  const { focusVerse } = usePanelManager();
  useEffect(() => {
    focusVerse(verseKey);
  }, [verseKey, focusVerse]);
  return <TafsirPanel />;
}

describe("TafsirPanel", () => {
  it("renders empty state when no verse focused", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<TafsirPanel />);
    expect(screen.getByText("Select a verse to view tafsir")).toBeInTheDocument();
  });

  it("renders the tafsir heading with verse key", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<TafsirPanelWithFocus verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("Tafsir for 1:1")).toBeInTheDocument();
    });
  });

  it("renders tafsir text with HTML sanitized", async () => {
    const tafsir = createMockTafsir({
      text: "<p>This is a tafsir.</p><script>alert('xss')</script>",
    });

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/tafsirs")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              ok: true,
              data: [createMockTafsirResource()],
            }),
          ),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true, data: tafsir })),
      );
    });

    render(<TafsirPanelWithFocus verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("This is a tafsir.")).toBeInTheDocument();
    });

    // Script should be sanitized out
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });
});
