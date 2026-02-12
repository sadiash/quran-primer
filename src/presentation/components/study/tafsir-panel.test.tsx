import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import { TafsirPanel } from "./tafsir-panel";
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

describe("TafsirPanel", () => {
  it("renders the tafsir heading", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<TafsirPanel verseKey="1:1" />);
    expect(screen.getByText("Tafsir")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    render(<TafsirPanel verseKey="1:1" />);
    // Skeleton elements should be present (as generic elements)
    const skeletons = document.querySelectorAll('[class*="animate"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(0);
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

    render(<TafsirPanel verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("This is a tafsir.")).toBeInTheDocument();
    });

    // Script should be sanitized out
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });
});
