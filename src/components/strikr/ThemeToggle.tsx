"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full surface-2 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px]" strokeWidth={2.2} />
      ) : (
        <Moon className="w-[18px] h-[18px]" strokeWidth={2.2} />
      )}
    </button>
  );
}
