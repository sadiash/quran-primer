import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import { HadithPanel } from "./hadith-panel";
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

describe("HadithPanel", () => {
  it("renders the heading", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<HadithPanel defaultQuery="Al-Fatihah 1:1" />);
    expect(screen.getByText("Related Hadith")).toBeInTheDocument();
  });

  it("renders search input with default query", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: [] })),
    );

    render(<HadithPanel defaultQuery="Al-Fatihah 1:1" />);
    const input = screen.getByPlaceholderText("Search hadith...");
    expect(input).toHaveValue("Al-Fatihah 1:1");
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

    render(<HadithPanel defaultQuery="test" />);

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

    render(<HadithPanel defaultQuery="nonexistent" />);

    await waitFor(() => {
      expect(
        screen.getByText("No hadith found for this query."),
      ).toBeInTheDocument();
    });
  });
});
