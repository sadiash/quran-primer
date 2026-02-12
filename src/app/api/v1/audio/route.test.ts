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

describe("GET /api/v1/audio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns recitations", async () => {
    const recitations = [
      { verseKey: "1:1", url: "https://audio.qurancdn.com/1.mp3" },
    ];
    mockService.getRecitation.mockResolvedValue(recitations);

    const response = await GET(
      createRequest("http://localhost/api/v1/audio?surah_id=1&reciter_id=7") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
  });

  it("returns 400 when params missing", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/audio") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 400 when params not numbers", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/audio?surah_id=abc&reciter_id=def") as never,
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });
});
