import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { SurahHeader } from "./surah-header";
import { createMockSurah } from "@/test/helpers/mock-data";
import type { Surah } from "@/core/types";

const surah: Surah = createMockSurah({
  id: 1,
  nameArabic: "الفاتحة",
  nameSimple: "Al-Fatihah",
  nameTranslation: "The Opener",
  revelationType: "makkah",
  versesCount: 7,
});

describe("SurahHeader", () => {
  it("renders all surah info", () => {
    render(<SurahHeader surah={surah} />);
    expect(screen.getByText("الفاتحة")).toBeInTheDocument();
    expect(screen.getByText("Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("The Opener")).toBeInTheDocument();
    expect(screen.getByText("makkah")).toBeInTheDocument();
    expect(screen.getByText("7 verses")).toBeInTheDocument();
  });
});
