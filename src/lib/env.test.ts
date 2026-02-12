import { describe, it, expect, beforeEach } from "vitest";
import { getServerEnv, getClientEnv, resetEnvCache } from "./env";

describe("env validation", () => {
  beforeEach(() => {
    resetEnvCache();
  });

  it("getServerEnv() returns defaults for minimal env", () => {
    const env = getServerEnv();
    expect(env.NODE_ENV).toBeDefined();
    expect(env.QURAN_API_BASE_URL).toBe("https://api.quran.com/api/v4");
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("getClientEnv() returns defaults", () => {
    const env = getClientEnv();
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("The Primer");
  });

  it("getServerEnv() caches result", () => {
    const first = getServerEnv();
    const second = getServerEnv();
    expect(first).toBe(second); // same reference
  });

  it("resetEnvCache() clears cached env", () => {
    const first = getServerEnv();
    resetEnvCache();
    const second = getServerEnv();
    expect(first).not.toBe(second); // new reference
    expect(first).toEqual(second); // same values
  });
});
