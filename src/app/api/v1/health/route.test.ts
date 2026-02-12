import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/health", () => {
  it("returns ok status", async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe("ok");
    expect(json.data.timestamp).toBeDefined();
  });
});
