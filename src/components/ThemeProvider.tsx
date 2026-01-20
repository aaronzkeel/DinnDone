"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "dinndone-theme";

// Store for theme state (external to React)
let themeState: Theme = "system";
const listeners = new Set<() => void>();

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ["light", "dark", "system"].includes(stored)) {
    return stored as Theme;
  }
  return "system";
}

function setStoredTheme(newTheme: Theme) {
  themeState = newTheme;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, newTheme);
    updateDocumentClass(newTheme);
  }
  listeners.forEach((listener) => listener());
}

function updateDocumentClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme !== "system") {
    root.classList.add(theme);
  }
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  return themeState;
}

function getServerSnapshot(): Theme {
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage on first render (client-side only)
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Initialize on mount
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored !== themeState) {
      themeState = stored;
      updateDocumentClass(stored);
      listeners.forEach((listener) => listener());
    } else {
      // Still apply the class on first mount
      updateDocumentClass(themeState);
    }
  }, []);

  // Calculate resolved theme
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      // Force re-render when system preference changes
      listeners.forEach((listener) => listener());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setStoredTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
