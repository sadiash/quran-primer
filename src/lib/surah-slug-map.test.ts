import { describe, it, expect } from "vitest";
import {
  surahSlugToNumber,
  surahNumberToSlug,
  scripturasIdToVerseKey,
} from "./surah-slug-map";

describe("surah-slug-map", () => {
  describe("surahSlugToNumber", () => {
    it("maps alfatiha to 1", () => {
      expect(surahSlugToNumber("alfatiha")).toBe(1);
    });

    it("maps albaqarah to 2", () => {
      expect(surahSlugToNumber("albaqarah")).toBe(2);
    });

    it("maps annas to 114", () => {
      expect(surahSlugToNumber("annas")).toBe(114);
    });

    it("maps yasin to 36", () => {
      expect(surahSlugToNumber("yasin")).toBe(36);
    });

    it("is case-insensitive", () => {
      expect(surahSlugToNumber("AlBaqarah")).toBe(2);
      expect(surahSlugToNumber("ALFATIHA")).toBe(1);
    });

    it("strips hyphens and underscores", () => {
      expect(surahSlugToNumber("al-fatiha")).toBe(1);
      expect(surahSlugToNumber("al_baqarah")).toBe(2);
    });

    it("returns undefined for unknown slugs", () => {
      expect(surahSlugToNumber("unknown")).toBeUndefined();
      expect(surahSlugToNumber("")).toBeUndefined();
    });
  });

  describe("surahNumberToSlug", () => {
    it("maps 1 to alfatiha", () => {
      expect(surahNumberToSlug(1)).toBe("alfatiha");
    });

    it("maps 114 to annas", () => {
      expect(surahNumberToSlug(114)).toBe("annas");
    });

    it("returns undefined for out-of-range numbers", () => {
      expect(surahNumberToSlug(0)).toBeUndefined();
      expect(surahNumberToSlug(115)).toBeUndefined();
    });
  });

  describe("scripturasIdToVerseKey", () => {
    it("converts albaqarah:247 to 2:247", () => {
      expect(scripturasIdToVerseKey("albaqarah:247")).toBe("2:247");
    });

    it("converts alfatiha:1 to 1:1", () => {
      expect(scripturasIdToVerseKey("alfatiha:1")).toBe("1:1");
    });

    it("handles hyphenated slugs", () => {
      expect(scripturasIdToVerseKey("al-baqarah:247")).toBe("2:247");
    });

    it("returns undefined for non-Quran IDs", () => {
      expect(scripturasIdToVerseKey("genesis:1:1")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(scripturasIdToVerseKey("")).toBeUndefined();
    });

    it("returns undefined for unknown surah slug", () => {
      expect(scripturasIdToVerseKey("unknownsurah:1")).toBeUndefined();
    });
  });
});
