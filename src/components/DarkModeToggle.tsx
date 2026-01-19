"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

/**
 * DarkModeToggle — cycles between light, dark, and system themes
 * Uses icons to show current mode:
 * - Sun = light mode
 * - Moon = dark mode
 * - Auto = system mode
 */
export function DarkModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    // Cycle: light -> dark -> system -> light
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") {
      // Sun icon
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    } else if (theme === "dark") {
      // Moon icon
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    } else {
      // System/Auto icon (monitor)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );
    }
  };

  const getLabel = () => {
    if (theme === "light") return "Light mode";
    if (theme === "dark") return "Dark mode";
    if (!mounted) return "System";
    return `System (${resolvedTheme})`;
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-harvest-card"
      style={{
        backgroundColor: "var(--color-card)",
        color: "var(--color-text)",
        border: "1px solid var(--color-border)",
      }}
      aria-label={`Current theme: ${getLabel()}. Click to change.`}
      title={getLabel()}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}
