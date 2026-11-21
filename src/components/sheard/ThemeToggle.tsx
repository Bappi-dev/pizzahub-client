"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "pizzahub-theme";
const THEME_CHANGE_EVENT = "pizzahub-theme-change";

function subscribe(onThemeChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function getPreferredTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-[#E8DED3] bg-white text-stone-700 shadow-sm transition-colors hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}
