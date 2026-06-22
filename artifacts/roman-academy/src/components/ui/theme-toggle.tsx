"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export type Theme = "dark" | "light";

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("ra_theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("ra-light");
    root.classList.remove("ra-dark");
  } else {
    root.classList.add("ra-dark");
    root.classList.remove("ra-light");
  }
  try { localStorage.setItem("ra_theme", theme); } catch {}
  window.dispatchEvent(new CustomEvent("ra-theme-change", { detail: theme }));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = getStoredTheme();
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-gold-400/20 bg-navy-950/50 hover:bg-white/10 text-gold-300 transition-all flex items-center gap-2 text-xs font-semibold"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark"
        ? <><Sun className="size-4" /><span className="hidden sm:inline">Light</span></>
        : <><Moon className="size-4" /><span className="hidden sm:inline">Dark</span></>
      }
    </button>
  );
}

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return getStoredTheme();
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<Theme>;
      setTheme(custom.detail);
    };
    window.addEventListener("ra-theme-change", handler);
    return () => window.removeEventListener("ra-theme-change", handler);
  }, []);

  return theme;
}
