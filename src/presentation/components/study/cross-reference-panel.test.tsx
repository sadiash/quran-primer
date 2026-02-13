import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { CrossReferencePanel } from "./cross-reference-panel";
import { usePanelManager } from "@/presentation/providers/panel-provider";
import { createMockCrossScriptureCluster } from "@/test/helpers/mock-data";

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
function CrossRefWithFocus({ verseKey }: { verseKey: string }) {
  const { focusVerse } = usePanelManager();
  useEffect(() => {
    focusVerse(verseKey);
  }, [verseKey, focusVerse]);
  return <CrossReferencePanel />;
}

describe("CrossReferencePanel", () => {
  it("renders empty state when no verse focused", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<CrossReferencePanel />);
    expect(
      screen.getByText("Select a verse to see cross-scripture references"),
    ).toBeInTheDocument();
  });

  it("renders heading with verse key when focused", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<CrossRefWithFocus verseKey="2:247" />);

    await waitFor(() => {
      expect(
        screen.getByText("Cross-References for 2:247"),
      ).toBeInTheDocument();
    });
  });

  it("shows no results message when no clusters found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<CrossRefWithFocus verseKey="2:247" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No cross-scripture references found for this verse.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders cluster cards with summary and similarity", async () => {
    const clusters = [
      createMockCrossScriptureCluster({
        id: "cluster-1",
        summary: "Creation of mankind and divine sovereignty",
        similarity: 0.85,
      }),
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: clusters })),
    );

    render(<CrossRefWithFocus verseKey="2:247" />);

    await waitFor(() => {
      expect(
        screen.getByText("Creation of mankind and divine sovereignty"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("85% match")).toBeInTheDocument();
  });

  it("expands cluster to show verses on click", async () => {
    const clusters = [
      createMockCrossScriptureCluster({
        id: "cluster-1",
        summary: "Test cluster",
        similarity: 0.9,
        verses: [
          {
            source: "quran",
            book: "Quran",
            chapter: 2,
            verse: 247,
            text: "Their prophet said to them...",
            verseKey: "2:247",
          },
          {
            source: "bible",
            book: "Genesis",
            chapter: 1,
            verse: 26,
            text: "Then God said, Let us make mankind in our image.",
          },
        ],
      }),
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: clusters })),
    );

    const user = userEvent.setup();
    render(<CrossRefWithFocus verseKey="2:247" />);

    await waitFor(() => {
      expect(screen.getByText("Test cluster")).toBeInTheDocument();
    });

    // Click to expand
    await user.click(screen.getByText("Test cluster"));

    await waitFor(() => {
      expect(screen.getByText("Genesis 1:26")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Then God said, Let us make mankind in our image."),
    ).toBeInTheDocument();
  });

  it("shows error message on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          error: { message: "Server error" },
        }),
      ),
    );

    render(<CrossRefWithFocus verseKey="2:247" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to load cross-references. Please try again.",
        ),
      ).toBeInTheDocument();
    });
  });
});
