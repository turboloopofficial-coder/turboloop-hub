"use client";

// Light/dark theme toggle. Persists to localStorage. The CSS in
// globals.css already supports both themes via CSS variables — this
// component just toggles the .dark class on <html>.
//
// SSR-safe: server renders nothing, hydrates client-side once the
// stored theme is read. No flash of wrong theme because the inline
// script in layout.tsx applies the class before paint.

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("turboloop_theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // First render: read stored theme. Mark mounted by setting state.
  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  // Sync DOM + storage whenever theme changes.
  useEffect(() => {
    if (!theme) return;
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("turboloop_theme", theme);
    } catch {}
  }, [theme]);

  // Avoid hydration mismatch — render a stable placeholder until mounted
  if (theme === null) {
    return (
      <div
        aria-hidden="true"
        className="w-9 h-9 rounded-[var(--r-md)]"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--r-md)] text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors active:scale-95"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
