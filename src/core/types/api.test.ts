import { describe, it, expect } from "vitest";
import type { ApiResponse, ApiSuccess, ApiError } from "@/core/types";
import type { Surah } from "@/core/types";

describe("API envelope types", () => {
  it("ApiSuccess wraps data with ok: true", () => {
    const response: ApiSuccess<Surah[]> = {
      ok: true,
      data: [],
      meta: { total: 0 },
    };
    expect(response.ok).toBe(true);
    expect(response.data).toEqual([]);
  });

  it("ApiError has code and message", () => {
    const response: ApiError = {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Surah not found",
      },
    };
    expect(response.ok).toBe(false);
    expect(response.error.code).toBe("NOT_FOUND");
  });

  it("ApiResponse discriminates via ok field", () => {
    const success: ApiResponse<string> = { ok: true, data: "hello" };
    const failure: ApiResponse<string> = {
      ok: false,
      error: { code: "FAIL", message: "oops" },
    };

    if (success.ok) {
      expect(success.data).toBe("hello");
    }

    if (!failure.ok) {
      expect(failure.error.code).toBe("FAIL");
    }
  });
});
