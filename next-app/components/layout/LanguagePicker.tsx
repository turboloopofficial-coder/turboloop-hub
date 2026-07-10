"use client";

// LanguagePicker — locale switcher in the navbar.
//
// DESKTOP: useState-driven hover dropdown.
//   - onMouseEnter on the WRAPPER div (trigger + dropdown together) → open
//   - onMouseLeave on the WRAPPER div → close
//   - The wrapper has paddingTop on the dropdown so there is NO gap between
//     the trigger and the dropdown panel. Mouse never leaves the wrapper.
//   - No ref callbacks, no duplicate listeners, no relatedTarget checks.
//
// MOBILE: Click-triggered portal bottom sheet.
//
// LANGUAGE SWITCHING BEHAVIOUR:
//   Always preserves the current page path when switching locale.
//   e.g. /blog → /ar/blog, /films/what-is-turboloop → /zh/films/what-is-turboloop
//   Pages that don't have a translated version will render in English content
//   but the locale prefix is still set so the nav/blog section reflect the language.

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Globe, X, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

/**
 * Strip the current locale prefix from a pathname and return the bare path.
 * e.g. "/ar/blog/some-post" → "/blog/some-post"
 *      "/blog/some-post"    → "/blog/some-post"  (English has no prefix)
 */
function stripLocalePrefix(pathname: string): string {
  for (const l of LOCALES) {
    if (l === "en") continue; // English has no prefix
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/**
 * Build the target href for a given locale, preserving the current page path.
 * English uses no prefix: /blog  (not /en/blog)
 * All other locales prefix:  /ar/blog, /zh/films/what-is-turboloop, etc.
 */
function getLocalePath(locale: Locale, currentPathname: string): string {
  const barePath = stripLocalePrefix(currentPathname); // e.g. "/blog/some-post"
  if (locale === "en") return barePath || "/";
  return `/${locale}${barePath === "/" ? "" : barePath}`;
}

export function LanguagePicker() {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const pathParts = pathname.split("/").filter(Boolean);
  const currentLocale: Locale =
    pathParts.length > 0 && LOCALES.includes(pathParts[0] as Locale)
      ? (pathParts[0] as Locale)
      : "en";
  const current = LOCALE_LABELS[currentLocale];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const localeLinks = LOCALES.map((locale) => {
    const info = LOCALE_LABELS[locale];
    const isActive = locale === currentLocale;
    const href = getLocalePath(locale, pathname);
    return (
      <a
        key={locale}
        href={href}
        role="option"
        aria-selected={isActive}
        onClick={() => {
          // Set NEXT_LOCALE cookie so next-intl middleware doesn't redirect
          // back to the old locale when navigating to the new URL.
          document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
          setDesktopOpen(false);
          setMobileOpen(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 12px",
          borderRadius: "10px",
          textDecoration: "none",
          color: "inherit",
          background: isActive ? "rgba(0,200,200,0.12)" : "transparent",
          transition: "background 0.12s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <span style={{ fontSize: "20px", width: "28px", textAlign: "center", flexShrink: 0 }}>
          {info.flag}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block",
            fontWeight: 600,
            fontSize: "13px",
            color: isActive ? "var(--c-brand-cyan, #00c8c8)" : "var(--c-text, #111)",
            lineHeight: 1.3,
          }}>
            {info.native}
          </span>
          <span style={{
            display: "block",
            fontSize: "11px",
            color: "var(--c-text-muted, #666)",
            marginTop: "1px",
          }}>
            {info.label}
          </span>
        </span>
        {isActive && <Check style={{ width: 14, height: 14, color: "var(--c-brand-cyan, #00c8c8)", flexShrink: 0 }} />}
      </a>
    );
  });

  // Mobile portal sheet
  const mobileSheet = mounted && mobileOpen ? createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
    >
      <div
        onMouseDown={() => setMobileOpen(false)}
        onTouchStart={() => setMobileOpen(false)}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
        aria-hidden="true"
      />
      <div
        role="listbox"
        aria-label="Select language"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "var(--c-bg, #fff)",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid var(--c-border, #e5e7eb)",
          maxHeight: "85vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--c-border, #e5e7eb)", margin: "12px auto 4px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 4px" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text, #111)" }}>Select Language</span>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ padding: 8, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "var(--c-text-muted, #666)" }}
            aria-label="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>
        <div style={{ padding: "8px" }}>{localeLinks}</div>
        <div style={{ height: 32 }} />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* ── DESKTOP: wrapper-hover dropdown — no gap, no duplicate listeners ── */}
      <div
        className="hidden md:block"
        style={{ position: "relative" }}
        onMouseEnter={() => setDesktopOpen(true)}
        onMouseLeave={() => setDesktopOpen(false)}
      >
        {/* Trigger button */}
        <button
          className="flex items-center gap-1.5 px-2.5 min-h-[40px] h-10 rounded-[var(--r-md)] text-sm font-medium transition"
          style={{
            color: desktopOpen ? "var(--c-text)" : "var(--c-text-muted)",
            background: desktopOpen ? "var(--c-surface)" : "transparent",
            border: desktopOpen ? "1px solid var(--c-border)" : "1px solid transparent",
          }}
          aria-label={`Language: ${current.native}. Hover to change.`}
          aria-haspopup="listbox"
          aria-expanded={desktopOpen}
          // Prevent button focus-steal which can interfere with hover
          onMouseDown={(e) => e.preventDefault()}
        >
          <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden lg:inline text-xs ml-0.5">{current.native}</span>
        </button>

        {/* Dropdown — no gap: uses paddingTop so it's flush with the trigger */}
        <div
          role="listbox"
          aria-label="Select language"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            // paddingTop creates a seamless invisible bridge — mouse never leaves the wrapper
            paddingTop: "6px",
            width: "220px",
            zIndex: 200,
            // Visibility controlled by state — smooth fade
            opacity: desktopOpen ? 1 : 0,
            pointerEvents: desktopOpen ? "auto" : "none",
            transform: desktopOpen ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid var(--c-border, #e5e7eb)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              background: "color-mix(in oklab, var(--c-surface, #f9fafb) 97%, transparent)",
              backdropFilter: "blur(16px)",
              padding: "6px",
              maxHeight: "min(480px, calc(100vh - 80px))",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {localeLinks}
          </div>
        </div>
      </div>

      {/* ── MOBILE: click-triggered portal bottom sheet ── */}
      <button
        className="flex md:hidden items-center gap-1.5 px-2.5 min-h-[40px] h-10 rounded-[var(--r-md)] text-sm font-medium text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] border border-transparent hover:border-[var(--c-border)] transition"
        onClick={() => setMobileOpen(true)}
        aria-label={`Language: ${current.native}. Tap to change.`}
        aria-haspopup="listbox"
        aria-expanded={mobileOpen}
      >
        <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-base leading-none">{current.flag}</span>
      </button>

      {mobileSheet}
    </>
  );
}
