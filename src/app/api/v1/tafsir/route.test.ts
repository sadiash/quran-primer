import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockQuranService } from "@/test/helpers/mock-services";

vi.mock("server-only", () => ({}));

const mockService = createMockQuranService();
vi.mock("@/lib/services", () => ({
  getQuranService: () => mockService,
}));

import { GET } from "./route";

function createRequest(url: string) {
  return new Request(url);
}

describe("GET /api/v1/tafsir", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns tafsir for a verse", async () => {
    const tafsir = {
      id: 1,
      resourceId: 1,
      resourceName: "Ibn Kathir",
      languageCode: "en",
      verseKey: "1:1",
      text: "Commentary text",
    };
    mockService.getTafsir.mockResolvedValue(tafsir);

    const response = await GET(
      createRequest("http://localhost/api/v1/tafsir?verse_key=1:1&tafsir_id=1") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.verseKey).toBe("1:1");
  });

  it("returns 400 when params missing", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/tafsir") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 404 when tafsir not found", async () => {
    mockService.getTafsir.mockResolvedValue(null);

    const response = await GET(
      createRequest("http://localhost/api/v1/tafsir?verse_key=1:1&tafsir_id=999") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.ok).toBe(false);
  });
});
