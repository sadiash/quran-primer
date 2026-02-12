import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./schema";
import { DexiePreferencesRepository } from "./preferences-repo";
import type { UserPreferences } from "@/core/types";

describe("DexiePreferencesRepository", () => {
  const repo = new DexiePreferencesRepository();

  beforeEach(async () => {
    await db.preferences.clear();
  });

  function makePrefs(overrides: Partial<UserPreferences> = {}): UserPreferences {
    return {
      id: "default",
      theme: "system",
      arabicFont: "uthmani",
      arabicFontSize: "lg",
      translationFontSize: "md",
      showTranslation: true,
      defaultTranslationId: 131,
      defaultReciterId: 7,
      updatedAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  it("get() returns null when no preferences exist", async () => {
    const prefs = await repo.get();
    expect(prefs).toBeNull();
  });

  it("save() and get()", async () => {
    await repo.save(makePrefs());
    const prefs = await repo.get();
    expect(prefs).not.toBeNull();
    expect(prefs!.theme).toBe("system");
    expect(prefs!.arabicFont).toBe("uthmani");
  });

  it("save() upserts preferences", async () => {
    await repo.save(makePrefs({ theme: "light" }));
    await repo.save(makePrefs({ theme: "dark" }));

    const prefs = await repo.get();
    expect(prefs!.theme).toBe("dark");
  });

  it("supports custom id for per-user preferences", async () => {
    await repo.save(makePrefs({ id: "user-123", theme: "dark" }));

    const defaultPrefs = await repo.get();
    expect(defaultPrefs).toBeNull();

    const userPrefs = await repo.get("user-123");
    expect(userPrefs).not.toBeNull();
    expect(userPrefs!.theme).toBe("dark");
  });
});
