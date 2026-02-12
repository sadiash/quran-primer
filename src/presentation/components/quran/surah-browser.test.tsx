import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { SurahBrowser } from "./surah-browser";
import { createMockSurah } from "@/test/helpers/mock-data";
import type { Surah } from "@/core/types";

const surahs: Surah[] = [
  createMockSurah({ id: 1, nameSimple: "Al-Fatihah", nameTranslation: "The Opener", revelationType: "makkah", versesCount: 7 }),
  createMockSurah({ id: 2, nameSimple: "Al-Baqarah", nameTranslation: "The Cow", revelationType: "madinah", versesCount: 286 }),
  createMockSurah({ id: 3, nameSimple: "Ali 'Imran", nameTranslation: "Family of Imran", revelationType: "madinah", versesCount: 200 }),
];

describe("SurahBrowser", () => {
  it("renders all surahs", () => {
    render(<SurahBrowser surahs={surahs} />);
    expect(screen.getByText("Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText("Ali 'Imran")).toBeInTheDocument();
  });

  it("filters by search text", async () => {
    const user = userEvent.setup();
    render(<SurahBrowser surahs={surahs} />);

    await user.type(screen.getByPlaceholderText("Search surahs..."), "Baqarah");
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.queryByText("Al-Fatihah")).not.toBeInTheDocument();
  });

  it("filters by revelation type", async () => {
    const user = userEvent.setup();
    render(<SurahBrowser surahs={surahs} />);

    await user.click(screen.getByText("Makkah"));
    expect(screen.getByText("Al-Fatihah")).toBeInTheDocument();
    expect(screen.queryByText("Al-Baqarah")).not.toBeInTheDocument();
  });

  it("shows empty state when no matches", async () => {
    const user = userEvent.setup();
    render(<SurahBrowser surahs={surahs} />);

    await user.type(screen.getByPlaceholderText("Search surahs..."), "zzzznotfound");
    expect(screen.getByText("No surahs match your search.")).toBeInTheDocument();
  });
});
