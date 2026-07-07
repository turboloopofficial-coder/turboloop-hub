"use client";

// LanguagePicker — locale switcher in the navbar.
//
// NAVIGATION LOGIC:
// Only 5 pages have locale versions: / /calculator /faq /apply /token
// All other pages (/creatives, /blog, /films, etc.) have no locale version.
//
// Rules:
// - If current page has a locale version → navigate to /{locale}/{page}
// - If current page has NO locale version → navigate to /{locale} (locale homepage)
// - English (default) has no prefix → navigate to /{page} or /
// - Uses window.location.href for hard navigation to guarantee full page reload
//   and correct layout/provider initialization for the new locale.
//
// MOBILE: full-screen portal bottom sheet (escapes navbar stacking context).
// DESKTOP: compact dropdown anchored to the button.

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Globe, X, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

// Pages that have locale-specific versions under app/[locale]/
const LOCALIZED_PAGES = new Set(["", "calculator", "faq", "apply", "token"]);

function getLocalePath(locale: Locale, currentPathname: string): string {
  // Strip any existing locale prefix from the pathname
  let pagePath = currentPathname;
  for (const l of LOCALES) {
    if (l === "en") continue;
    if (pagePath === `/${l}` || pagePath.startsWith(`/${l}/`)) {
      pagePath = pagePath.slice(l.length + 1) || "/";
      break;
    }
  }

  // Get the page segment (e.g. "calculator" from "/calculator")
  const pageSegment = pagePath.split("/").filter(Boolean)[0] ?? "";

  // Determine the target page path
  let targetPage: string;
  if (LOCALIZED_PAGES.has(pageSegment)) {
    // This page has a locale version
    targetPage = pagePath === "/" ? "" : pagePath;
  } else {
    // This page has no locale version → go to locale homepage
    targetPage = "";
  }

  // Build the final URL
  if (locale === "en") {
    return targetPage || "/";
  } else {
    return `/${locale}${targetPage}`;
  }
}

export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  // Detect current locale from the pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentLocale: Locale =
    pathParts.length > 0 && LOCALES.includes(pathParts[0] as Locale)
      ? (pathParts[0] as Locale)
      : "en";
  const current = LOCALE_LABELS[currentLocale];

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const switchLocale = useCallback((locale: Locale) => {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }
    setOpen(false);
    const targetPath = getLocalePath(locale, pathname);
    // Hard navigation: ensures the correct [locale] layout and
    // NextIntlClientProvider are initialized for the new locale.
    window.location.href = targetPath;
  }, [pathname, currentLocale]);

  const localeList = (
    <div style={{ padding: "8px" }}>
      {LOCALES.map((locale) => {
        const info = LOCALE_LABELS[locale];
        const isActive = locale === currentLocale;
        return (
          <button
            key={locale}
            role="option"
            aria-selected={isActive}
            onClick={() => switchLocale(locale)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              textAlign: "left",
              background: isActive ? "rgba(0,200,200,0.12)" : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <span style={{ fontSize: "22px", width: "32px", textAlign: "center", flexShrink: 0 }}>
              {info.flag}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "block",
                fontWeight: 600,
                fontSize: "14px",
                color: isActive ? "var(--c-brand-cyan, #00c8c8)" : "var(--c-text, #111)",
              }}>
                {info.native}
              </span>
              <span style={{
                display: "block",
                fontSize: "12px",
                color: "var(--c-text-muted, #666)",
                marginTop: "1px",
              }}>
                {info.label}
              </span>
            </span>
            {isActive && (
              <Check style={{ width: 16, height: 16, color: "var(--c-brand-cyan, #00c8c8)", flexShrink: 0 }} />
            )}
          </button>
        );
      })}
    </div>
  );

  // Mobile portal sheet
  const mobileSheet = mounted && open ? createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
        }}
        aria-hidden="true"
      />
      {/* Sheet panel */}
      <div
        role="listbox"
        aria-label="Select language"
        style={{
          position: "relative",
          background: "var(--c-bg, #fff)",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid var(--c-border, #e5e7eb)",
          maxHeight: "85vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--c-border, #e5e7eb)", margin: "12px auto 4px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 4px" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text, #111)" }}>
            Select Language
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{ padding: 8, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "var(--c-text-muted, #666)" }}
            aria-label="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>
        {localeList}
        <div style={{ height: 32 }} />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Trigger button */}
      <div style={{ position: "relative" }}>
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

        {/* Desktop dropdown */}
        {open && (
          <div
            role="listbox"
            aria-label="Select language"
            className="hidden md:block absolute right-0 top-full mt-2 w-56 rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-xl)] overflow-hidden"
            style={{
              zIndex: 200,
              background: "color-mix(in oklab, var(--c-surface) 97%, transparent)",
              backdropFilter: "blur(16px)",
            }}
          >
            {localeList}
          </div>
        )}
      </div>

      {/* Mobile portal sheet */}
      {mobileSheet}
    </>
  );
}
