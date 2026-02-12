import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockHadithAdapter } from "@/test/helpers/mock-services";

vi.mock("server-only", () => ({}));

const mockAdapter = createMockHadithAdapter();
vi.mock("@/lib/services", () => ({
  getHadithAdapter: () => mockAdapter,
}));

import { GET } from "./route";

function createRequest(url: string) {
  return new Request(url);
}

describe("GET /api/v1/hadith", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hadith search results", async () => {
    const results = [
      { id: 1, collection: "bukhari", bookNumber: "1", hadithNumber: "1", text: "hadith text", grade: null, narratedBy: null },
    ];
    mockAdapter.searchHadith.mockResolvedValue(results);

    const response = await GET(
      createRequest("http://localhost/api/v1/hadith?q=prayer") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.meta.total).toBe(1);
  });

  it("returns 400 when q is missing", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/hadith") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("passes collection param when provided", async () => {
    mockAdapter.searchHadith.mockResolvedValue([]);

    await GET(
      createRequest("http://localhost/api/v1/hadith?q=prayer&collection=bukhari") as never,
    );

    expect(mockAdapter.searchHadith).toHaveBeenCalledWith("prayer", "bukhari");
  });
});
