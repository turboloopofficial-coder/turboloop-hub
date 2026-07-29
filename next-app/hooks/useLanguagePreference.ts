"use client";
// ─────────────────────────────────────────────────────────────────────────────
// useLanguagePreference — persists the user's chosen language across all pages
//
// Priority order:
//   1. localStorage (user explicitly chose this language before)
//   2. URL locale  (e.g. /ar/podcast → Arabic)
//   3. English fallback
//
// Usage:
//   const { savedCode, saveLanguage } = useLanguagePreference();
//
// Call saveLanguage(lang.code) whenever the user picks a language.
// On next page load, savedCode will be the previously chosen code.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from "react";

const STORAGE_KEY = "turboloop_lang";

export function useLanguagePreference() {
  const getSavedCode = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  const saveLanguage = useCallback((code: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage blocked (private mode, etc.) — silently ignore
    }
  }, []);

  return { getSavedCode, saveLanguage };
}
