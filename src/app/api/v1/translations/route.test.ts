import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockQuranService } from "@/test/helpers/mock-services";
import { createMockTranslationResource } from "@/test/helpers/mock-data";

vi.mock("server-only", () => ({}));

const mockService = createMockQuranService();
vi.mock("@/lib/services", () => ({
  getQuranService: () => mockService,
}));

import { GET } from "./route";

describe("GET /api/v1/translations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns available translations", async () => {
    const resources = [
      createMockTranslationResource({ id: 20, name: "Sahih International" }),
      createMockTranslationResource({ id: 85, name: "Yusuf Ali", authorName: "Abdullah Yusuf Ali" }),
    ];
    mockService.getAvailableTranslations.mockResolvedValue(resources);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.meta.total).toBe(2);
  });

  it("returns empty array when no translations available", async () => {
    mockService.getAvailableTranslations.mockResolvedValue([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(0);
    expect(json.meta.total).toBe(0);
  });

  it("returns 500 on service error", async () => {
    mockService.getAvailableTranslations.mockRejectedValue(new Error("fail"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.ok).toBe(false);
  });
});
