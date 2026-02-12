import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockQuranService } from "@/test/helpers/mock-services";
import { createMockReciter } from "@/test/helpers/mock-data";

vi.mock("server-only", () => ({}));

const mockService = createMockQuranService();
vi.mock("@/lib/services", () => ({
  getQuranService: () => mockService,
}));

import { GET } from "./route";

describe("GET /api/v1/reciters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all reciters", async () => {
    const reciters = [
      createMockReciter({ id: 7, name: "Mishari" }),
      createMockReciter({ id: 1, name: "Abdul Basit" }),
    ];
    mockService.getReciters.mockResolvedValue(reciters);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.meta.total).toBe(2);
  });

  it("returns 500 on error", async () => {
    mockService.getReciters.mockRejectedValue(new Error("fail"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.ok).toBe(false);
  });
});
