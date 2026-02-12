import { describe, it, expect } from "vitest";
import { toEasternArabicNumeral } from "./arabic-utils";

describe("toEasternArabicNumeral", () => {
  it("converts single digits", () => {
    expect(toEasternArabicNumeral(0)).toBe("٠");
    expect(toEasternArabicNumeral(1)).toBe("١");
    expect(toEasternArabicNumeral(9)).toBe("٩");
  });

  it("converts multi-digit numbers", () => {
    expect(toEasternArabicNumeral(10)).toBe("١٠");
    expect(toEasternArabicNumeral(114)).toBe("١١٤");
    expect(toEasternArabicNumeral(255)).toBe("٢٥٥");
    expect(toEasternArabicNumeral(286)).toBe("٢٨٦");
  });
});
