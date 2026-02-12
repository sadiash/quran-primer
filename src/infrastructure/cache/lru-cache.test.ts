import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LruCache } from "./lru-cache";

describe("LruCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves values", () => {
    const cache = new LruCache<string>();
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for missing keys", () => {
    const cache = new LruCache<string>();
    expect(cache.get("nope")).toBeUndefined();
  });

  it("evicts expired entries", () => {
    const cache = new LruCache<string>({ ttlMs: 1000 });
    cache.set("key1", "value1");

    vi.advanceTimersByTime(999);
    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(2);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("supports per-entry TTL override", () => {
    const cache = new LruCache<string>({ ttlMs: 10_000 });
    cache.set("short", "val", 500);
    cache.set("long", "val");

    vi.advanceTimersByTime(501);
    expect(cache.get("short")).toBeUndefined();
    expect(cache.get("long")).toBe("val");
  });

  it("evicts LRU entry when at capacity", () => {
    const cache = new LruCache<string>({ maxSize: 3 });
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");

    // Access "a" to make it most recently used
    cache.get("a");

    // Adding "d" should evict "b" (least recently used)
    cache.set("d", "4");

    expect(cache.get("a")).toBe("1");
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe("3");
    expect(cache.get("d")).toBe("4");
  });

  it("has() checks existence and TTL", () => {
    const cache = new LruCache<string>({ ttlMs: 500 });
    cache.set("key", "val");

    expect(cache.has("key")).toBe(true);
    expect(cache.has("nope")).toBe(false);

    vi.advanceTimersByTime(501);
    expect(cache.has("key")).toBe(false);
  });

  it("delete() removes entries", () => {
    const cache = new LruCache<string>();
    cache.set("key", "val");
    expect(cache.delete("key")).toBe(true);
    expect(cache.get("key")).toBeUndefined();
  });

  it("clear() removes all entries", () => {
    const cache = new LruCache<string>();
    cache.set("a", "1");
    cache.set("b", "2");
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("tracks size correctly", () => {
    const cache = new LruCache<string>();
    expect(cache.size).toBe(0);
    cache.set("a", "1");
    cache.set("b", "2");
    expect(cache.size).toBe(2);
    cache.delete("a");
    expect(cache.size).toBe(1);
  });
});
