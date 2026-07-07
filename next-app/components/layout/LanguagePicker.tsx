"use client";

// LanguagePicker — locale switcher in the navbar.
//
// The Navbar uses backdrop-blur which creates a CSS stacking context.
// Any position:fixed child is trapped inside that context and cannot
// cover the full page. Fix: render the mobile sheet via ReactDOM.createPortal
// directly onto document.body, which sits outside all stacking contexts.
//
// Mobile (<md): full-screen portal bottom sheet.
// Desktop (md+): compact dropdown anchored to the button (no portal needed).

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Globe, X, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure we're client-side before using portals
  useEffect(() => { setMounted(true); }, []);

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
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const switchLocale = useCallback((locale: Locale) => {
    setOpen(false);
    let newPath = pathname;
    const localePrefix = `/${currentLocale}`;
    if (currentLocale !== "en" && newPath.startsWith(localePrefix)) {
      newPath = newPath.slice(localePrefix.length) || "/";
    }
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
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              textAlign: "left",
              background: isActive ? "rgba(0,200,200,0.1)" : "transparent",
              color: isActive ? "var(--c-brand-cyan, #00c8c8)" : "var(--c-text, #111)",
              fontWeight: isActive ? 600 : 400,
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "22px", width: "32px", textAlign: "center", flexShrink: 0 }}>
              {info.flag}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 500, color: "var(--c-text, #111)" }}>
                {info.native}
              </span>
              <span style={{ display: "block", fontSize: "12px", color: "var(--c-text-muted, #666)" }}>
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

  // Mobile sheet rendered via portal to escape stacking contexts
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
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: "var(--c-border, #e5e7eb)",
          margin: "12px auto 4px",
        }} />
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 8px",
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--c-text, #111)" }}>
            Select Language
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{
              padding: 8, borderRadius: "50%", border: "none",
              background: "transparent", cursor: "pointer",
              color: "var(--c-text-muted, #666)",
            }}
            aria-label="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>
        {localeList}
        {/* iOS safe area */}
        <div style={{ height: 32 }} />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Trigger button + desktop dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
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

      {/* Mobile portal sheet — rendered outside all stacking contexts */}
      {mobileSheet}
    </>
  );
}
