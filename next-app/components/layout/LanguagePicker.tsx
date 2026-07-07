"use client";

// LanguagePicker — locale switcher in the navbar.
//
// DESKTOP: CSS-only hover dropdown. The <a> links are ALWAYS in the DOM (just hidden via CSS).
//   No JavaScript state change happens before navigation — clicking an <a> fires natively.
//   The dropdown appears on :hover of the container div (group/peer Tailwind pattern).
//
// MOBILE: Click-triggered portal bottom sheet. The sheet is rendered via createPortal to
//   document.body, escaping the navbar's backdrop-filter stacking context.
//   stopPropagation on the sheet panel prevents backdrop-tap from firing when an option is tapped.

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Globe, X, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";

const LOCALIZED_PAGES = new Set(["", "calculator", "faq", "apply", "token"]);

function getLocalePath(locale: Locale, currentPathname: string): string {
  let pagePath = currentPathname;
  for (const l of LOCALES) {
    if (l === "en") continue;
    if (pagePath === `/${l}` || pagePath.startsWith(`/${l}/`)) {
      pagePath = pagePath.slice(l.length + 1) || "/";
      break;
    }
  }
  const pageSegment = pagePath.split("/").filter(Boolean)[0] ?? "";
  let targetPage: string;
  if (LOCALIZED_PAGES.has(pageSegment)) {
    targetPage = pagePath === "/" ? "" : pagePath;
  } else {
    targetPage = "";
  }
  if (locale === "en") return targetPage || "/";
  return `/${locale}${targetPage}`;
}

export function LanguagePicker() {
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          borderRadius: "12px",
          textDecoration: "none",
          color: "inherit",
          background: isActive ? "rgba(0,200,200,0.12)" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
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
        {isActive && <Check style={{ width: 16, height: 16, color: "var(--c-brand-cyan, #00c8c8)", flexShrink: 0 }} />}
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
      {/* ── DESKTOP: CSS hover dropdown (no JS state, links always in DOM) ── */}
      <div
        className="hidden md:block"
        style={{ position: "relative" }}
        // The dropdown is shown via CSS :hover on this container
      >
        {/* Trigger */}
        <button
          className="flex items-center gap-1.5 px-2.5 min-h-[40px] h-10 rounded-[var(--r-md)] text-sm font-medium text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] border border-transparent hover:border-[var(--c-border)] transition"
          aria-label={`Language: ${current.native}. Hover to change.`}
          aria-haspopup="listbox"
          // No onClick — the hover CSS handles showing the dropdown
          // Prevent button from stealing focus which would close hover
          onMouseDown={(e) => e.preventDefault()}
        >
          <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden lg:inline text-xs ml-0.5">{current.native}</span>
        </button>

        {/* Dropdown — always rendered, shown on hover via CSS */}
        <div
          role="listbox"
          aria-label="Select language"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            width: "224px",
            borderRadius: "16px",
            border: "1px solid var(--c-border, #e5e7eb)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            background: "color-mix(in oklab, var(--c-surface, #f9fafb) 97%, transparent)",
            backdropFilter: "blur(16px)",
            // Hidden by default, shown on hover of parent
            opacity: 0,
            pointerEvents: "none",
            transform: "translateY(-4px)",
            transition: "opacity 0.15s, transform 0.15s",
            zIndex: 200,
          }}
          className="peer-hover:opacity-100 group-hover:opacity-100"
          // We use inline JS to handle hover since CSS :has() isn't universally supported
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
            el.style.transform = "translateY(0)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            el.style.transform = "translateY(-4px)";
          }}
          ref={(el) => {
            // Show dropdown when trigger button is hovered
            if (!el) return;
            const parent = el.parentElement;
            if (!parent) return;
            const trigger = parent.querySelector("button");
            if (!trigger) return;
            const show = () => {
              el.style.opacity = "1";
              el.style.pointerEvents = "auto";
              el.style.transform = "translateY(0)";
            };
            const hide = () => {
              el.style.opacity = "0";
              el.style.pointerEvents = "none";
              el.style.transform = "translateY(-4px)";
            };
            trigger.addEventListener("mouseenter", show);
            trigger.addEventListener("mouseleave", (e2) => {
              // Don't hide if moving to dropdown
              const related = (e2 as MouseEvent).relatedTarget as Node;
              if (el.contains(related)) return;
              hide();
            });
            el.addEventListener("mouseleave", (e2) => {
              const related = (e2 as MouseEvent).relatedTarget as Node;
              if (trigger.contains(related)) return;
              hide();
            });
          }}
        >
          <div style={{ padding: "8px" }}>{localeLinks}</div>
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
