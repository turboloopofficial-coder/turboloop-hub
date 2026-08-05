"use client";

// LanguagePicker — locale switcher in the navbar.
//
// DESKTOP: hover-triggered dropdown with a live search input.
//   - onMouseEnter on the WRAPPER div → open
//   - onMouseLeave on the WRAPPER div → close
//   - Seamless invisible bridge via paddingTop so mouse never leaves wrapper.
//
// MOBILE: Click-triggered portal bottom sheet with a live search input.
//
// LANGUAGE SWITCHING BEHAVIOUR:
//   Always preserves the current page path when switching locale.
//   e.g. /blog → /ar/blog, /films/what-is-turboloop → /zh/films/what-is-turboloop

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Globe, X, Check, Search } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

/**
 * Strip the current locale prefix from a pathname and return the bare path.
 */
function stripLocalePrefix(pathname: string): string {
  for (const l of LOCALES) {
    if (l === "en") continue;
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/**
 * Build the target href for a given locale, preserving the current page path.
 */
function getLocalePath(locale: Locale, currentPathname: string): string {
  const barePath = stripLocalePrefix(currentPathname);
  if (locale === "en") return barePath || "/";
  return `/${locale}${barePath === "/" ? "" : barePath}`;
}

// ─── Language list item ───────────────────────────────────────────────────────
function LangOption({
  locale,
  isActive,
  href,
  onSelect,
}: {
  locale: Locale;
  isActive: boolean;
  href: string;
  onSelect: () => void;
}) {
  const info = LOCALE_LABELS[locale];
  return (
    <a
      href={href}
      role="option"
      aria-selected={isActive}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
        onSelect();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 10px",
        borderRadius: "9px",
        textDecoration: "none",
        color: "inherit",
        background: isActive ? "rgba(0,200,200,0.12)" : "transparent",
        transition: "background 0.1s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(128,128,128,0.08)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ fontSize: "18px", width: "26px", textAlign: "center", flexShrink: 0 }}>
        {info.flag}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block",
          fontWeight: 600,
          fontSize: "13px",
          color: isActive ? "var(--c-brand-cyan, #00c8c8)" : "var(--c-text, #111)",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
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
      {isActive && <Check style={{ width: 13, height: 13, color: "var(--c-brand-cyan, #00c8c8)", flexShrink: 0 }} />}
    </a>
  );
}

// ─── Search input ─────────────────────────────────────────────────────────────
function SearchInput({
  value,
  onChange,
  inputRef,
  placeholder = "Search language…",
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative", padding: "6px 8px 4px" }}>
      <Search
        style={{
          position: "absolute",
          left: "18px",
          top: "50%",
          transform: "translateY(-50%)",
          width: 13,
          height: 13,
          color: "var(--c-text-muted, #888)",
          pointerEvents: "none",
        }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          paddingLeft: "30px",
          paddingRight: value ? "28px" : "10px",
          paddingTop: "7px",
          paddingBottom: "7px",
          borderRadius: "8px",
          border: "1px solid var(--c-border, #e5e7eb)",
          background: "var(--c-surface, #f9fafb)",
          color: "var(--c-text, #111)",
          fontSize: "13px",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "var(--c-brand-cyan, #00c8c8)";
          (e.currentTarget as HTMLInputElement).style.boxShadow = "0 0 0 2px rgba(0,200,200,0.15)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "var(--c-border, #e5e7eb)";
          (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
        }}
      />
      {value && (
        <button
          onMouseDown={(e) => { e.preventDefault(); onChange(""); }}
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "var(--c-text-muted, #888)",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Clear search"
        >
          <X style={{ width: 12, height: 12 }} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LanguagePicker() {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Detect current locale from URL
  const pathParts = pathname.split("/").filter(Boolean);
  const currentLocale: Locale =
    pathParts.length > 0 && LOCALES.includes(pathParts[0] as Locale)
      ? (pathParts[0] as Locale)
      : "en";
  const current = LOCALE_LABELS[currentLocale];

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Auto-focus search when desktop dropdown opens
  useEffect(() => {
    if (desktopOpen) {
      setDesktopSearch("");
      setTimeout(() => desktopSearchRef.current?.focus(), 80);
    }
  }, [desktopOpen]);

  // Auto-focus search when mobile sheet opens
  useEffect(() => {
    if (mobileOpen) {
      setMobileSearch("");
      setTimeout(() => mobileSearchRef.current?.focus(), 120);
    }
  }, [mobileOpen]);

  // Filter helper
  const filterLocales = (q: string) => {
    if (!q.trim()) return LOCALES as Locale[];
    const lower = q.toLowerCase();
    return (LOCALES as Locale[]).filter((locale) => {
      const info = LOCALE_LABELS[locale];
      return (
        info.label.toLowerCase().includes(lower) ||
        info.native.toLowerCase().includes(lower) ||
        locale.toLowerCase().includes(lower)
      );
    });
  };

  const desktopFiltered = useMemo(() => filterLocales(desktopSearch), [desktopSearch]);
  const mobileFiltered = useMemo(() => filterLocales(mobileSearch), [mobileSearch]);

  // Render a list of locale options
  const renderOptions = (filtered: Locale[], onSelect: () => void) =>
    filtered.length === 0 ? (
      <div style={{
        padding: "20px 12px",
        textAlign: "center",
        color: "var(--c-text-muted, #888)",
        fontSize: "13px",
      }}>
        No languages found
      </div>
    ) : (
      filtered.map((locale) => (
        <LangOption
          key={locale}
          locale={locale}
          isActive={locale === currentLocale}
          href={getLocalePath(locale, pathname)}
          onSelect={onSelect}
        />
      ))
    );

  // ── Mobile portal bottom sheet ──────────────────────────────────────────────
  const mobileSheet = mounted && mobileOpen ? createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div
        onMouseDown={() => setMobileOpen(false)}
        onTouchStart={() => setMobileOpen(false)}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
        aria-hidden="true"
      />
      {/* Sheet */}
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
          display: "flex",
          flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--c-border, #e5e7eb)", margin: "12px auto 4px", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 4px", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text, #111)" }}>
            🌐 Select Language
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ padding: 8, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "var(--c-text-muted, #666)" }}
            aria-label="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Search */}
        <div style={{ flexShrink: 0, padding: "0 8px 4px" }}>
          <SearchInput
            value={mobileSearch}
            onChange={setMobileSearch}
            inputRef={mobileSearchRef}
            placeholder="Search 61 languages…"
          />
        </div>

        {/* Results count */}
        {mobileSearch && (
          <div style={{ padding: "2px 16px 4px", fontSize: 11, color: "var(--c-text-muted, #888)", flexShrink: 0 }}>
            {mobileFiltered.length} result{mobileFiltered.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Scrollable list */}
        <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "4px 8px", flex: 1 }}>
          {renderOptions(mobileFiltered, () => setMobileOpen(false))}
        </div>

        <div style={{ height: 16, flexShrink: 0 }} />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* ── DESKTOP: wrapper-hover dropdown with search ── */}
      <div
        className="hidden md:block"
        style={{ position: "relative" }}
        onMouseEnter={() => setDesktopOpen(true)}
        onMouseLeave={() => { setDesktopOpen(false); setDesktopSearch(""); }}
      >
        {/* Trigger */}
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
          onMouseDown={(e) => e.preventDefault()}
        >
          <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden lg:inline text-xs ml-0.5">{current.native}</span>
        </button>

        {/* Dropdown panel */}
        <div
          role="listbox"
          aria-label="Select language"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            paddingTop: "6px",
            width: "240px",
            zIndex: 200,
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
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
              background: "color-mix(in oklab, var(--c-surface, #f9fafb) 97%, transparent)",
              backdropFilter: "blur(16px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "min(520px, calc(100vh - 80px))",
            }}
          >
            {/* Search bar */}
            <div style={{ flexShrink: 0, borderBottom: "1px solid var(--c-border, #e5e7eb)" }}>
              <SearchInput
                value={desktopSearch}
                onChange={setDesktopSearch}
                inputRef={desktopSearchRef}
                placeholder="Search 61 languages…"
              />
            </div>

            {/* Results count */}
            {desktopSearch && (
              <div style={{ padding: "3px 14px 0", fontSize: 11, color: "var(--c-text-muted, #888)", flexShrink: 0 }}>
                {desktopFiltered.length} result{desktopFiltered.length !== 1 ? "s" : ""}
              </div>
            )}

            {/* Scrollable list */}
            <div style={{ overflowY: "auto", padding: "4px 6px 6px", flex: 1 }}>
              {renderOptions(desktopFiltered, () => { setDesktopOpen(false); setDesktopSearch(""); })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: click-triggered portal bottom sheet with search ── */}
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
