import { describe, it, expect, vi, beforeEach } from "vitest";
import { CrossReferenceAdapter } from "./cross-reference-adapter";

// Mock the HttpClient
const mockGet = vi.fn();
vi.mock("@/infrastructure/http", () => ({
  HttpClient: vi.fn(function (this: Record<string, unknown>) {
    this.get = mockGet;
  }),
}));

const MOCK_CLUSTERS = [
  {
    cluster_id: 1,
    summary: "Creation of mankind and divine sovereignty",
    similarity: 0.85,
    verses: [
      {
        id: "albaqarah:247",
        text: "Their prophet said to them, Indeed Allah has sent to you Talut as a king.",
        source: "quran",
      },
      {
        id: "genesis:1:26",
        text: "Then God said, Let us make mankind in our image.",
        source: "bible",
        book: "Genesis",
        chapter: 1,
        verse: 26,
      },
    ],
  },
  {
    cluster_id: 2,
    summary: "Guidance and light",
    similarity: 0.78,
    verses: [
      {
        id: "alfatiha:5",
        text: "Guide us on the straight path.",
        source: "quran",
      },
      {
        id: "psalms:119:105",
        text: "Your word is a lamp for my feet, a light on my path.",
        source: "bible",
        book: "Psalms",
        chapter: 119,
        verse: 105,
      },
    ],
  },
  {
    cluster_id: 3,
    summary: "Torah and covenant",
    similarity: 0.72,
    verses: [
      {
        id: "albaqarah:40",
        text: "O Children of Israel, remember My favor.",
        source: "quran",
      },
      {
        id: "deuteronomy:7:9",
        text: "Know therefore that the LORD your God is God.",
        source: "torah",
        book: "Deuteronomy",
        chapter: 7,
        verse: 9,
      },
    ],
  },
];

describe("CrossReferenceAdapter", () => {
  let adapter: CrossReferenceAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new CrossReferenceAdapter("https://test.api");
  });

  describe("getCrossReferences", () => {
    it("returns clusters containing the requested Quran verse", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.getCrossReferences("2:247");

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("1");
      expect(result[0]!.summary).toBe(
        "Creation of mankind and divine sovereignty",
      );
      expect(result[0]!.similarity).toBe(0.85);
    });

    it("maps Quran verse slugs to verse keys", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.getCrossReferences("2:247");

      const quranVerse = result[0]!.verses.find((v) => v.source === "quran");
      expect(quranVerse?.verseKey).toBe("2:247");
      expect(quranVerse?.chapter).toBe(2);
      expect(quranVerse?.verse).toBe(247);
    });

    it("maps Bible verses correctly", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.getCrossReferences("2:247");

      const bibleVerse = result[0]!.verses.find((v) => v.source === "bible");
      expect(bibleVerse?.book).toBe("Genesis");
      expect(bibleVerse?.chapter).toBe(1);
      expect(bibleVerse?.verse).toBe(26);
      expect(bibleVerse?.verseKey).toBeUndefined();
    });

    it("returns empty array when no clusters match", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.getCrossReferences("99:1");

      expect(result).toEqual([]);
    });

    it("returns empty array on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      const result = await adapter.getCrossReferences("2:247");

      expect(result).toEqual([]);
    });

    it("uses cache on repeated calls", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      await adapter.getCrossReferences("2:247");
      await adapter.getCrossReferences("2:247");

      // HttpClient.get should only be called once (cache hit on second)
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("handles Torah source correctly", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.getCrossReferences("2:40");

      expect(result).toHaveLength(1);
      const torahVerse = result[0]!.verses.find((v) => v.source === "torah");
      expect(torahVerse?.book).toBe("Deuteronomy");
    });
  });

  describe("searchCrossReferences", () => {
    it("filters clusters by summary text", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.searchCrossReferences("guidance");

      expect(result).toHaveLength(1);
      expect(result[0]!.summary).toBe("Guidance and light");
    });

    it("filters clusters by verse text", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.searchCrossReferences("lamp");

      expect(result).toHaveLength(1);
      expect(result[0]!.summary).toBe("Guidance and light");
    });

    it("is case-insensitive", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.searchCrossReferences("CREATION");

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("1");
    });

    it("returns empty array when no clusters match", async () => {
      mockGet.mockResolvedValue(MOCK_CLUSTERS);

      const result = await adapter.searchCrossReferences("zzz_no_match_zzz");

      expect(result).toEqual([]);
    });

    it("returns empty array on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      const result = await adapter.searchCrossReferences("creation");

      expect(result).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("handles null/empty API response", async () => {
      mockGet.mockResolvedValue(null);

      const result = await adapter.getCrossReferences("2:247");

      expect(result).toEqual([]);
    });

    it("handles clusters without summary", async () => {
      mockGet.mockResolvedValue([
        {
          cluster_id: 10,
          verses: [
            { id: "alfatiha:1", text: "Bismillah", source: "quran" },
          ],
        },
      ]);

      const result = await adapter.getCrossReferences("1:1");

      expect(result).toHaveLength(1);
      expect(result[0]!.summary).toBe("");
      expect(result[0]!.similarity).toBe(0);
    });

    it("handles verse with chapter/verse fields directly", async () => {
      mockGet.mockResolvedValue([
        {
          cluster_id: 20,
          summary: "Direct fields",
          similarity: 0.9,
          verses: [
            {
              id: "quran:3:45",
              text: "Test verse",
              source: "quran",
              chapter: 3,
              verse: 45,
            },
          ],
        },
      ]);

      const result = await adapter.getCrossReferences("3:45");

      expect(result).toHaveLength(1);
      expect(result[0]!.verses[0]!.verseKey).toBe("3:45");
    });
  });
});
