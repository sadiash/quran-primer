import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpClient, HttpError } from "./http-client";

describe("HttpClient", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      statusText: status === 200 ? "OK" : "Error",
      headers: { "Content-Type": "application/json" },
    });
  }

  it("performs GET requests", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ surahs: [] }));

    const client = new HttpClient({ baseUrl: "https://api.test.com", retries: 0 });
    const result = await client.get<{ surahs: unknown[] }>("/surahs");

    expect(result.surahs).toEqual([]);
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0]?.[0]).toBe("https://api.test.com/surahs");
  });

  it("performs POST requests with body", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const client = new HttpClient({ baseUrl: "https://api.test.com", retries: 0 });
    await client.post("/data", { key: "value" });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"key":"value"}');
  });

  it("throws HttpError on 4xx responses", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: "not found" }, 404));

    const client = new HttpClient({
      baseUrl: "https://api.test.com",
      retries: 0,
    });

    await expect(client.get("/missing")).rejects.toThrow(HttpError);
  });

  it("retries on 5xx errors", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ error: "server error" }, 500))
      .mockResolvedValueOnce(jsonResponse({ data: "ok" }));

    const client = new HttpClient({
      baseUrl: "https://api.test.com",
      retries: 1,
      backoffMs: 1,
    });

    const result = await client.get<{ data: string }>("/endpoint");
    expect(result.data).toBe("ok");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries on 5xx", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: "server error" }, 500));

    const client = new HttpClient({
      baseUrl: "https://api.test.com",
      retries: 2,
      backoffMs: 1,
    });

    await expect(client.get("/failing")).rejects.toThrow(HttpError);
    expect(mockFetch).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("retries on network errors", async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const client = new HttpClient({
      baseUrl: "https://api.test.com",
      retries: 1,
      backoffMs: 1,
    });

    const result = await client.get<{ ok: boolean }>("/endpoint");
    expect(result.ok).toBe(true);
  });

  it("passes custom headers to fetch", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const client = new HttpClient({
      baseUrl: "https://api.test.com",
      headers: { "X-Api-Key": "abc" },
      retries: 0,
    });

    await client.get("/endpoint", { headers: { "X-Custom": "123" } });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Api-Key"]).toBe("abc");
    expect(headers["X-Custom"]).toBe("123");
  });
});
