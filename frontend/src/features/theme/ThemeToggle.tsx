import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "./themeStore";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button onClick={toggleTheme} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={cn("grid size-11 place-items-center rounded-full border border-border bg-card", className)}>
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
