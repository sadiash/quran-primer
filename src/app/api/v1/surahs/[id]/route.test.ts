import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockQuranService } from "@/test/helpers/mock-services";
import { createMockSurahWithVerses } from "@/test/helpers/mock-data";

vi.mock("server-only", () => ({}));

const mockService = createMockQuranService();
vi.mock("@/lib/services", () => ({
  getQuranService: () => mockService,
}));

import { GET } from "./route";

function createRequest(url: string) {
  return new Request(url);
}

describe("GET /api/v1/surahs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns surah by id", async () => {
    const surah = createMockSurahWithVerses({ id: 1 });
    mockService.getSurah.mockResolvedValue(surah);

    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe(1);
  });

  it("returns 400 for invalid id", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/abc") as never,
      { params: Promise.resolve({ id: "abc" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 400 for out-of-range id", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/200") as never,
      { params: Promise.resolve({ id: "200" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 404 for non-existent surah", async () => {
    mockService.getSurah.mockResolvedValue(null);

    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.ok).toBe(false);
  });

  it("returns surah with translation when param provided", async () => {
    const result = {
      surah: createMockSurahWithVerses({ id: 1 }),
      translations: [],
    };
    mockService.getSurahWithTranslation.mockResolvedValue(result);

    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1?translation=131") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("returns surah with multiple translations when translations param provided", async () => {
    const result = {
      surah: createMockSurahWithVerses({ id: 1 }),
      translations: { 20: [], 85: [] },
    };
    mockService.getSurahWithMultipleTranslations.mockResolvedValue(result);

    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1?translations=20,85") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockService.getSurahWithMultipleTranslations).toHaveBeenCalledWith(1, [20, 85]);
  });

  it("returns 400 for invalid translations param", async () => {
    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1?translations=abc,xyz") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns 404 when surah not found with multiple translations", async () => {
    mockService.getSurahWithMultipleTranslations.mockResolvedValue(null);

    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1?translations=20,85") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.ok).toBe(false);
  });

  it("translations param takes precedence over translation param", async () => {
    const result = {
      surah: createMockSurahWithVerses({ id: 1 }),
      translations: { 20: [] },
    };
    mockService.getSurahWithMultipleTranslations.mockResolvedValue(result);

    const response = await GET(
      createRequest("http://localhost/api/v1/surahs/1?translations=20&translation=131") as never,
      { params: Promise.resolve({ id: "1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockService.getSurahWithMultipleTranslations).toHaveBeenCalledWith(1, [20]);
    expect(mockService.getSurahWithTranslation).not.toHaveBeenCalled();
  });
});
