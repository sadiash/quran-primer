import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockGetCrossReferences = vi.fn().mockResolvedValue([]);
const mockSearchCrossReferences = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/services", () => ({
  getCrossReferenceAdapter: () => ({
    getCrossReferences: mockGetCrossReferences,
    searchCrossReferences: mockSearchCrossReferences,
  }),
}));

import { GET } from "./route";

function createRequest(url: string) {
  return new Request(url);
}

describe("GET /api/v1/cross-references", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cross-references for a verse key", async () => {
    const clusters = [
      {
        id: "1",
        summary: "Creation of mankind",
        similarity: 0.85,
        verses: [
          {
            source: "quran",
            book: "Quran",
            chapter: 2,
            verse: 247,
            text: "Their prophet said...",
            verseKey: "2:247",
          },
        ],
      },
    ];
    mockGetCrossReferences.mockResolvedValue(clusters);

    const response = await GET(
      createRequest(
        "http://localhost/api/v1/cross-references?verse_key=2:247",
      ) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.meta.total).toBe(1);
    expect(mockGetCrossReferences).toHaveBeenCalledWith("2:247");
  });

  it("returns search results when q is provided", async () => {
    const clusters = [
      { id: "2", summary: "Guidance and light", similarity: 0.78, verses: [] },
    ];
    mockSearchCrossReferences.mockResolvedValue(clusters);

    const response = await GET(
      createRequest(
        "http://localhost/api/v1/cross-references?q=guidance",
      ) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(mockSearchCrossReferences).toHaveBeenCalledWith("guidance");
  });

  it("verse_key takes precedence over q", async () => {
    mockGetCrossReferences.mockResolvedValue([]);

    const response = await GET(
      createRequest(
        "http://localhost/api/v1/cross-references?verse_key=2:247&q=guidance",
      ) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockGetCrossReferences).toHaveBeenCalledWith("2:247");
    expect(mockSearchCrossReferences).not.toHaveBeenCalled();
  });

  it("returns 400 when neither verse_key nor q is provided", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/cross-references") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 400 for invalid verse_key format", async () => {
    const response = await GET(
      createRequest(
        "http://localhost/api/v1/cross-references?verse_key=invalid",
      ) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 500 on unexpected error", async () => {
    mockGetCrossReferences.mockRejectedValue(new Error("Unexpected"));

    const response = await GET(
      createRequest(
        "http://localhost/api/v1/cross-references?verse_key=2:247",
      ) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.ok).toBe(false);
  });
});
