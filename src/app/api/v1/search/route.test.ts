import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockQuranService } from "@/test/helpers/mock-services";
import { createMockVerse } from "@/test/helpers/mock-data";

vi.mock("server-only", () => ({}));

const mockService = createMockQuranService();
vi.mock("@/lib/services", () => ({
  getQuranService: () => mockService,
}));

import { GET } from "./route";

function createRequest(url: string) {
  return new Request(url);
}

describe("GET /api/v1/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns search results", async () => {
    const results = [createMockVerse({ verseKey: "1:1" })];
    mockService.searchQuran.mockResolvedValue(results);

    const response = await GET(
      createRequest("http://localhost/api/v1/search?q=bismillah") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.meta.total).toBe(1);
  });

  it("returns 400 when q is missing", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/search") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 400 when q is empty", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/search?q=") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });
});
