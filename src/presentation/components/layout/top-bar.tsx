"use client";

import { Menu, Command, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { IconButton } from "@/presentation/components/ui";

interface TopBarProps {
  onMenuToggle: () => void;
  onCommandPalette?: () => void;
}

export function TopBar({ onMenuToggle, onCommandPalette }: TopBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border px-3">
      <div className="flex items-center gap-2">
        <IconButton
          label="Toggle menu"
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu />
        </IconButton>
      </div>

      <div className="flex items-center gap-1">
        <IconButton label="Command palette (Ctrl+K)" variant="ghost" size="sm" onClick={onCommandPalette}>
          <Command />
        </IconButton>
        <IconButton
          label="Toggle theme"
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-smooth dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-smooth dark:rotate-0 dark:scale-100" />
        </IconButton>
      </div>
    </header>
  );
}
