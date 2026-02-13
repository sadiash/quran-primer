import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import { HadithPanel } from "./hadith-panel";
import { usePanelManager } from "@/presentation/providers/panel-provider";
import { createMockHadith } from "@/test/helpers/mock-data";

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
function HadithPanelWithFocus({ verseKey }: { verseKey: string }) {
  const { focusVerse } = usePanelManager();
  useEffect(() => {
    focusVerse(verseKey);
  }, [verseKey, focusVerse]);
  return <HadithPanel />;
}

describe("HadithPanel", () => {
  it("renders empty state when no verse focused", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<HadithPanel />);
    expect(
      screen.getByText("Select a verse to view related hadith"),
    ).toBeInTheDocument();
  });

  it("renders the heading with verse key", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<HadithPanelWithFocus verseKey="1:1" />);

    await waitFor(() => {
      expect(screen.getByText("Related Hadith for 1:1")).toBeInTheDocument();
    });
  });

  it("renders search input with verse key as query", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<HadithPanelWithFocus verseKey="1:1" />);

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Search hadith...");
      expect(input).toHaveValue("1:1");
    });
  });

  it("renders hadith cards with badges", async () => {
    const hadiths = [
      createMockHadith({
        id: 1,
        collection: "Sahih Bukhari",
        grade: "Sahih",
        narratedBy: "Abu Hurairah",
        hadithNumber: "42",
      }),
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: hadiths })),
    );

    render(<HadithPanelWithFocus verseKey="test" />);

    await waitFor(() => {
      expect(screen.getByText("Sahih Bukhari")).toBeInTheDocument();
    });

    expect(screen.getByText("Sahih")).toBeInTheDocument();
    expect(screen.getByText(/Abu Hurairah/)).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
  });

  it("shows no results message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<HadithPanelWithFocus verseKey="nonexistent" />);

    await waitFor(() => {
      expect(
        screen.getByText("No hadith found for this query."),
      ).toBeInTheDocument();
    });
  });
});
