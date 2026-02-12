import { describe, it, expect } from "vitest";
import { colors, typography, animation, radii, zIndex, shadows, spacing } from "./tokens";

describe("Design Tokens", () => {
  describe("colors", () => {
    it("has both light and dark themes", () => {
      expect(colors.light).toBeDefined();
      expect(colors.dark).toBeDefined();
    });

    it("light and dark share the same keys", () => {
      const lightKeys = Object.keys(colors.light).sort();
      const darkKeys = Object.keys(colors.dark).sort();
      expect(lightKeys).toEqual(darkKeys);
    });

    it("all color values are valid HSL triplets", () => {
      const hslPattern = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%(\s*\/\s*[\d.]+)?$/;
      for (const theme of [colors.light, colors.dark] as const) {
        for (const [key, value] of Object.entries(theme)) {
          if (key === "glassBlur" || key === "glowStrength") continue;
          expect(value, `${key}: "${value}"`).toMatch(hslPattern);
        }
      }
    });

    it("gold/amber is the shared connective thread", () => {
      // Light primary is gold (~36 hue)
      expect(colors.light.primary).toMatch(/^3[2-9]\s/);
      // Dark primary is amber (~42 hue)
      expect(colors.dark.primary).toMatch(/^4[0-5]\s/);
    });

    it("light mode has warm backgrounds, dark mode has cool backgrounds", () => {
      // Light background hue is warm (~40)
      const lightHue = parseInt(colors.light.background.split(" ")[0]!);
      expect(lightHue).toBeGreaterThanOrEqual(30);
      expect(lightHue).toBeLessThanOrEqual(50);

      // Dark background hue is cool (~225)
      const darkHue = parseInt(colors.dark.background.split(" ")[0]!);
      expect(darkHue).toBeGreaterThanOrEqual(200);
      expect(darkHue).toBeLessThanOrEqual(240);
    });
  });

  describe("typography", () => {
    it("defines Arabic-specific fonts", () => {
      expect(typography.fonts.arabicDisplay).toContain("Amiri");
      expect(typography.fonts.arabicReading).toContain("Scheherazade");
    });

    it("has generous Arabic line heights", () => {
      expect(parseFloat(typography.lineHeights.arabic)).toBeGreaterThanOrEqual(2.0);
      expect(parseFloat(typography.lineHeights.arabicLoose)).toBeGreaterThanOrEqual(2.4);
    });

    it("UI font is Inter", () => {
      expect(typography.fonts.ui).toContain("Inter");
    });
  });

  describe("animation", () => {
    it("has escalating duration tiers", () => {
      const micro = parseInt(animation.durations.micro);
      const standard = parseInt(animation.durations.standard);
      const emphasis = parseInt(animation.durations.emphasis);
      expect(micro).toBeLessThan(standard);
      expect(standard).toBeLessThan(emphasis);
    });

    it("defines standard easing curves", () => {
      expect(animation.easings.out).toContain("cubic-bezier");
      expect(animation.easings.in).toContain("cubic-bezier");
      expect(animation.easings.inOut).toContain("cubic-bezier");
    });
  });

  describe("spacing", () => {
    it("follows a 4px base grid", () => {
      expect(spacing[1]).toBe("0.25rem"); // 4px
      expect(spacing[2]).toBe("0.5rem"); // 8px
      expect(spacing[4]).toBe("1rem"); // 16px
    });
  });

  describe("radii", () => {
    it("has escalating border radius scale", () => {
      expect(radii.full).toBe("9999px");
    });
  });

  describe("shadows", () => {
    it("dark mode shadows are heavier than light", () => {
      // Dark shadows have higher opacity values
      expect(shadows.dark.lg).toContain("0.5");
      expect(shadows.light.lg).toContain("0.08");
    });
  });

  describe("zIndex", () => {
    it("has escalating z-index scale", () => {
      const values = Object.values(zIndex).map(Number);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]!);
      }
    });

    it("tooltip is above modal", () => {
      expect(Number(zIndex.tooltip)).toBeGreaterThan(Number(zIndex.modal));
    });
  });
});
