import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { SurahCard } from "./surah-card";
import { createMockSurah } from "@/test/helpers/mock-data";
import type { Surah } from "@/core/types";

const surah: Surah = createMockSurah({
  id: 2,
  nameSimple: "Al-Baqarah",
  nameArabic: "البقرة",
  nameTranslation: "The Cow",
  revelationType: "madinah",
  versesCount: 286,
});

describe("SurahCard", () => {
  it("renders surah details", () => {
    render(<SurahCard surah={surah} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("البقرة")).toBeInTheDocument();
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText("The Cow")).toBeInTheDocument();
    expect(screen.getByText("madinah")).toBeInTheDocument();
    expect(screen.getByText("286 verses")).toBeInTheDocument();
  });

  it("links to the surah page", () => {
    render(<SurahCard surah={surah} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/surahs/2");
  });
});
