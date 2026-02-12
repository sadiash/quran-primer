import { describe, it, expect } from "vitest";
import { ok, err, notFound, badRequest, serverError, toResponse } from "./api-helpers";

describe("api-helpers", () => {
  it("ok() wraps data in success envelope", () => {
    const result = ok([1, 2, 3]);
    expect(result).toEqual({ ok: true, data: [1, 2, 3] });
  });

  it("ok() includes optional meta", () => {
    const result = ok([], { total: 0, page: 1 });
    expect(result).toEqual({ ok: true, data: [], meta: { total: 0, page: 1 } });
  });

  it("err() creates error envelope", () => {
    const result = err("CUSTOM", "Something broke");
    expect(result).toEqual({
      ok: false,
      error: { code: "CUSTOM", message: "Something broke" },
    });
  });

  it("notFound() creates 404 error", () => {
    const result = notFound("Surah 115 not found");
    expect(result.error.code).toBe("NOT_FOUND");
    expect(result.error.message).toBe("Surah 115 not found");
  });

  it("badRequest() creates 400 error with details", () => {
    const result = badRequest("Invalid ID", { field: "id" });
    expect(result.error.code).toBe("BAD_REQUEST");
    expect(result.error.details).toEqual({ field: "id" });
  });

  it("serverError() creates 500 error", () => {
    const result = serverError();
    expect(result.error.code).toBe("INTERNAL_ERROR");
  });

  it("toResponse() returns correct status codes", async () => {
    const success = toResponse(ok("data"));
    expect(success.status).toBe(200);

    const missing = toResponse(notFound());
    expect(missing.status).toBe(404);

    const bad = toResponse(badRequest("bad"));
    expect(bad.status).toBe(400);

    const error = toResponse(serverError());
    expect(error.status).toBe(500);
  });

  it("toResponse() body is JSON", async () => {
    const response = toResponse(ok({ hello: "world" }));
    const body = await response.json();
    expect(body).toEqual({ ok: true, data: { hello: "world" } });
  });
});
