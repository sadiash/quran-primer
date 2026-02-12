import { describe, it, expect, vi, beforeEach } from "vitest";
import { CircuitBreaker, CircuitOpenError } from "./circuit-breaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
    });
  });

  it("starts in closed state", () => {
    expect(breaker.getState()).toBe("closed");
  });

  it("stays closed when calls succeed", async () => {
    await breaker.execute(() => Promise.resolve("ok"));
    await breaker.execute(() => Promise.resolve("ok"));
    expect(breaker.getState()).toBe("closed");
  });

  it("opens after reaching failure threshold", async () => {
    const fail = () => Promise.reject(new Error("fail"));

    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }

    expect(breaker.getState()).toBe("open");
  });

  it("rejects calls when open", async () => {
    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }

    await expect(
      breaker.execute(() => Promise.resolve("ok")),
    ).rejects.toThrow(CircuitOpenError);
  });

  it("transitions to half_open after reset timeout", async () => {
    vi.useFakeTimers();

    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }
    expect(breaker.getState()).toBe("open");

    vi.advanceTimersByTime(1001);
    expect(breaker.getState()).toBe("half_open");

    vi.useRealTimers();
  });

  it("closes on successful half_open call", async () => {
    vi.useFakeTimers();

    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }

    vi.advanceTimersByTime(1001);
    await breaker.execute(() => Promise.resolve("ok"));
    expect(breaker.getState()).toBe("closed");

    vi.useRealTimers();
  });

  it("re-opens on failed half_open call", async () => {
    vi.useFakeTimers();

    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }

    vi.advanceTimersByTime(1001);
    await breaker.execute(fail).catch(() => {});
    expect(breaker.getState()).toBe("open");

    vi.useRealTimers();
  });

  it("reset() returns to closed state", async () => {
    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }

    breaker.reset();
    expect(breaker.getState()).toBe("closed");
  });
});
