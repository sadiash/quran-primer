import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockQuranService } from "@/test/helpers/mock-services";
import { createMockTafsirResource } from "@/test/helpers/mock-data";

vi.mock("server-only", () => ({}));

const mockService = createMockQuranService();
vi.mock("@/lib/services", () => ({
  getQuranService: () => mockService,
}));

import { GET } from "./route";

describe("GET /api/v1/tafsirs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all tafsir resources", async () => {
    const tafsirs = [
      createMockTafsirResource({ id: 169, name: "Ibn Kathir" }),
      createMockTafsirResource({ id: 170, name: "Al-Tabari" }),
    ];
    mockService.getAvailableTafsirs.mockResolvedValue(tafsirs);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.meta.total).toBe(2);
  });

  it("returns 500 on error", async () => {
    mockService.getAvailableTafsirs.mockRejectedValue(new Error("fail"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.ok).toBe(false);
  });
});
