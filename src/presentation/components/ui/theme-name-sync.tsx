"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import type { ThemeName } from "@/core/types";

/**
 * Maps each named theme to its light/dark mode.
 * next-themes handles the class="dark" toggle;
 * this component sets data-theme on <html> for the color palette.
 */
const THEME_MODE: Record<ThemeName, "light" | "dark"> = {
  library: "light",
  observatory: "dark",
  amethyst: "light",
  cosmos: "dark",
  midnight: "dark",
  sahara: "light",
  garden: "light",
  matrix: "dark",
};

export function ThemeNameSync() {
  const { preferences } = usePreferences();
  const { setTheme } = useTheme();

  useEffect(() => {
    const themeName = preferences.themeName;
    const mode = THEME_MODE[themeName];

    // Set next-themes mode (adds/removes class="dark")
    setTheme(mode);

    // Set data-theme for CSS variable overrides
    // "library" and "observatory" use :root / .dark defaults — no data-theme needed
    if (themeName === "library" || themeName === "observatory") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeName);
    }
  }, [preferences.themeName, setTheme]);

  return null;
}
