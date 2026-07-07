"use client";

// LanguagePicker — compact globe-icon dropdown in the navbar.
// Shows the current locale's flag + native name, expands to all 8 locales.
// Uses next/navigation for locale-aware URL switching.

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detect current locale from the pathname
  // Pathname is like /th/calculator or /calculator (English)
  const pathParts = pathname.split("/").filter(Boolean);
  const currentLocale: Locale =
    pathParts.length > 0 && LOCALES.includes(pathParts[0] as Locale)
      ? (pathParts[0] as Locale)
      : "en";

  const current = LOCALE_LABELS[currentLocale];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(locale: Locale) {
    setOpen(false);
    // Build the new path: strip current locale prefix, add new one
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
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 min-h-[40px] h-10 rounded-[var(--r-md)] text-sm font-medium text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] border border-transparent hover:border-[var(--c-border)] transition"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline text-base leading-none">{current.flag}</span>
        <span className="hidden lg:inline text-xs">{current.native}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-xl)] overflow-hidden z-[var(--z-dropdown,60)]"
          style={{
            background: "color-mix(in oklab, var(--c-surface) 95%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="p-1.5">
            {LOCALES.map((locale) => {
              const info = LOCALE_LABELS[locale];
              const isActive = locale === currentLocale;
              return (
                <button
                  key={locale}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => switchLocale(locale)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-lg)] text-sm transition text-left ${
                    isActive
                      ? "bg-[var(--c-brand-cyan)]/10 text-[var(--c-brand-cyan)] font-semibold"
                      : "text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-bg)]"
                  }`}
                >
                  <span className="text-base leading-none w-6 text-center flex-shrink-0">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-brand-cyan)] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
