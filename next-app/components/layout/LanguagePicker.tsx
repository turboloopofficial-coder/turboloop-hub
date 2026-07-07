"use client";

// LanguagePicker — locale switcher in the navbar.
// Mobile: full-screen bottom sheet (easy thumb reach, no clipping issues).
// Desktop (md+): compact dropdown anchored to the button.

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, X, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detect current locale from the pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentLocale: Locale =
    pathParts.length > 0 && LOCALES.includes(pathParts[0] as Locale)
      ? (pathParts[0] as Locale)
      : "en";
  const current = LOCALE_LABELS[currentLocale];

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const switchLocale = useCallback((locale: Locale) => {
    setOpen(false);
    let newPath = pathname;
    // Remove existing locale prefix if present
    const localePrefix = `/${currentLocale}`;
    if (currentLocale !== "en" && newPath.startsWith(localePrefix)) {
      newPath = newPath.slice(localePrefix.length) || "/";
    }
    // Add new locale prefix (English has no prefix)
    if (locale !== "en") {
      newPath = `/${locale}${newPath === "/" ? "" : newPath}`;
    }
    router.push(newPath);
  }, [pathname, currentLocale, router]);

  const localeList = (
    <div className="p-2">
      {LOCALES.map((locale) => {
        const info = LOCALE_LABELS[locale];
        const isActive = locale === currentLocale;
        return (
          <button
            key={locale}
            role="option"
            aria-selected={isActive}
            onClick={() => switchLocale(locale)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] text-sm transition text-left ${
              isActive
                ? "bg-[var(--c-brand-cyan)]/10 text-[var(--c-brand-cyan)] font-semibold"
                : "text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] active:bg-[var(--c-surface)]"
            }`}
          >
            <span className="text-xl leading-none w-8 text-center flex-shrink-0">
              {info.flag}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-medium text-[var(--c-text)] truncate">
                {info.native}
              </span>
              <span className="block text-xs text-[var(--c-text-subtle)] truncate">
                {info.label}
              </span>
            </span>
            {isActive && (
              <Check className="w-4 h-4 text-[var(--c-brand-cyan)] flex-shrink-0" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Trigger button — always visible */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-2.5 min-h-[40px] h-10 rounded-[var(--r-md)] text-sm font-medium text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] border border-transparent hover:border-[var(--c-border)] transition"
          aria-label={`Language: ${current.native}. Tap to change.`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden lg:inline text-xs ml-0.5">{current.native}</span>
        </button>

        {/* Desktop dropdown — only on md+ screens */}
        {open && (
          <div
            role="listbox"
            aria-label="Select language"
            className="hidden md:block absolute right-0 top-full mt-2 w-56 rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-xl)] overflow-hidden z-[200]"
            style={{
              background: "color-mix(in oklab, var(--c-surface) 97%, transparent)",
              backdropFilter: "blur(16px)",
            }}
          >
            {localeList}
          </div>
        )}
      </div>

      {/* Mobile bottom sheet — slides up from bottom, full-width */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Sheet panel */}
          <div
            role="listbox"
            aria-label="Select language"
            className="relative rounded-t-[20px] border-t border-[var(--c-border)] max-h-[85vh] overflow-y-auto"
            style={{ background: "var(--c-bg)" }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-[var(--c-border)] mx-auto mt-3 mb-1" />
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-base font-semibold text-[var(--c-text)]">
                Select Language
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-1 rounded-full hover:bg-[var(--c-surface)] text-[var(--c-text-muted)] transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {localeList}
            {/* iOS safe area bottom padding */}
            <div className="h-8" />
          </div>
        </div>
      )}
    </>
  );
}
