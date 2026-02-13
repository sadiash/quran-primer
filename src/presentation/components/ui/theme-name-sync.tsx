"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import type { ThemeName } from "@/core/types";

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

    setTheme(mode);

    if (themeName === "library" || themeName === "observatory") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeName);
    }
  }, [preferences.themeName, setTheme]);

  return null;
}
