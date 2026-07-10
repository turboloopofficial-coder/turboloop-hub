"use client";

// Mobile menu drawer. Two-part component:
//   1) The trigger (gradient MENU button) rendered inline in the navbar.
//   2) The drawer (full-viewport overlay) rendered via createPortal to
//      document.body so no ancestor transform / overflow / sticky stacking
//      context can hide it. Mounted only when open === true.
//
// Drawer body — 4 pillar accordion sections, each with a 2-col grid of
// link cards. Every card is min-h-[56px] / touch target ≥48px.
//
// UX fixes (Jun 2026):
//   - touchAction:"manipulation" on hamburger + all link cards removes the
//     300ms tap delay on iOS Safari / Android Chrome.
//   - onTouchStart opacity flash gives sub-frame visual feedback — the user
//     sees the button respond the instant their finger touches it.
//   - "navstart" CustomEvent dispatched on every link click so NavProgressBar
//     starts the top progress bar on the same frame as the tap.
//   - activeHref state highlights the tapped card immediately (cyan border +
//     background) before the drawer closes and the route changes.

import { useEffect, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLocaleHref } from "@lib/i18n/useLocaleHref";
import { Brand } from "@components/Brand";
import {
  PROTOCOL_LINKS,
  WATCH_LINKS,
  COMMUNITY_LINKS,
  EARN_LINKS,
  type NavLinkItem,
} from "./nav-links";

const HamburgerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RocketIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
  </svg>
);

const DRAWER_ID = "mobile-menu-drawer";

// Pillar metadata — display label + the link array. Keep in sync with
// nav-links.ts; this is just a render-time grouping.
const PILLARS: Array<{ label: string; links: ReadonlyArray<NavLinkItem> }> = [
  { label: "Protocol",      links: PROTOCOL_LINKS },
  { label: "Watch & Learn", links: WATCH_LINKS },
  { label: "Community",     links: COMMUNITY_LINKS },
  { label: "Earn & Build",  links: EARN_LINKS },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  // `entered` flips a tick after the drawer mounts so the slide-in
  // transition has a from-state to animate from.
  const [entered, setEntered] = useState(false);
  // Track whether we've mounted on the client so createPortal doesn't
  // attempt to use document during SSR.
  const [mounted, setMounted] = useState(false);
  // Track the href that was just tapped for immediate visual feedback
  const [activeHref, setActiveHref] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  // Counter-based scroll lock — safe when WelcomePopup or other modals
  // are also open at the same time.
  useScrollLock(open);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      setActiveHref(null);
      return;
    }
    const raf1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /**
   * handleNavigate — called on every link click inside the drawer.
   * 1. Highlights the tapped card immediately (activeHref → cyan)
   * 2. Fires "navstart" so NavProgressBar starts on the same frame
   * 3. Closes the drawer
   */
  const handleNavigate = (href: string) => {
    setActiveHref(href);
    window.dispatchEvent(new CustomEvent("navstart"));
    setOpen(false);
  };

  const drawer =
    mounted && open
      ? createPortal(
          <div
            id={DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 md:hidden overflow-y-auto"
            style={{
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 9999,
              background: "var(--c-bg, #ffffff)",
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              transform: entered ? "translateX(0)" : "translateX(8%)",
              opacity: entered ? 1 : 0,
              transition:
                "transform 280ms cubic-bezier(0.16,1,0.3,1), opacity 240ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onClick={() => setOpen(false)}
          >
            {/* Sticky header inside drawer */}
            <div
              className="sticky top-0 flex items-center justify-between h-14 px-4 border-b z-10"
              style={{
                background: "var(--c-bg, #ffffff)",
                borderColor: "var(--c-border, rgba(15,23,42,0.08))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="/"
                onClick={() => handleNavigate("/")}
                className="flex items-center gap-2 font-bold text-lg tracking-tight"
              >
                <Brand size={28} />
                <span>
                  <span style={{ color: "var(--c-text, #0f172a)" }}>Turbo</span>
                  <span className="bg-brand bg-clip-text text-transparent">
                    Loop
                  </span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-[var(--r-md)] transition select-none"
                style={{
                  background: "var(--c-surface, #f7f8fc)",
                  color: "var(--c-text, #0f172a)",
                  border: "1px solid var(--c-border, rgba(15,23,42,0.08))",
                  touchAction: "manipulation",
                }}
                aria-label="Close menu"
                type="button"
                onTouchStart={(e) => (e.currentTarget.style.opacity = "0.5")}
                onTouchEnd={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseDown={(e) => (e.currentTarget.style.opacity = "0.5")}
                onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Drawer body — 4 pillar sections */}
            <div
              className="px-4 py-5"
              onClick={(e) => e.stopPropagation()}
            >
              {PILLARS.map((pillar) => (
                <PillarSection
                  key={pillar.label}
                  label={pillar.label}
                  links={pillar.links}
                  activeHref={activeHref}
                  onNavigate={handleNavigate}
                />
              ))}

              {/* Primary CTA */}
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center justify-center gap-2 w-full px-5 h-[52px] min-h-[48px] rounded-[var(--r-lg)] text-base font-bold text-white transition select-none"
                style={{
                  background: "var(--c-brand-gradient)",
                  touchAction: "manipulation",
                }}
                onTouchStart={(e) => (e.currentTarget.style.opacity = "0.75")}
                onTouchEnd={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseDown={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <RocketIcon />
                Launch App
              </a>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/*
       * HAMBURGER BUTTON — must respond before React fully hydrates.
       *
       * This IS a native <button> so it works natively. The key UX fixes:
       *   1. touchAction:"manipulation" — removes the 300ms iOS/Android tap
       *      delay that made the button feel unresponsive.
       *   2. onTouchStart opacity drop — fires the instant the finger touches
       *      the screen, giving visual feedback before onClick even runs.
       *   3. The button is always rendered (not inside Suspense or lazy) so
       *      it exists in the DOM as soon as the navbar renders.
       */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="md:hidden inline-flex items-center gap-2 px-3 min-h-[48px] h-11 rounded-[var(--r-lg)] text-white transition select-none"
        style={{
          background: "var(--c-brand-gradient)",
          boxShadow: "var(--s-brand)",
          touchAction: "manipulation",
        }}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={DRAWER_ID}
        type="button"
        onTouchStart={(e) => (e.currentTarget.style.opacity = "0.7")}
        onTouchEnd={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseDown={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <HamburgerIcon />
        <span className="text-xs font-bold tracking-wider uppercase">Menu</span>
      </button>
      {drawer}
    </>
  );
}

// ─── Pillar section — eyebrow + 2-col card grid ──────────────────

function PillarSection({
  label,
  links,
  activeHref,
  onNavigate,
}: {
  label: string;
  links: ReadonlyArray<NavLinkItem>;
  activeHref: string | null;
  onNavigate: (href: string) => void;
}) {
  const localize = useLocaleHref();
  return (
    <section className="mb-2">
      <div
        className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase px-1 mb-2 mt-5"
        style={{ color: "var(--c-text-subtle, #94A3B8)" }}
      >
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => {
          const isActive = activeHref === link.href;
          return (
            <Link
              key={link.href}
              href={localize(link.href)}
              onClick={() => onNavigate(link.href)}
              className="flex items-start gap-2.5 p-3 min-h-[56px] rounded-[var(--r-md)] transition select-none"
              style={{
                background: isActive
                  ? "color-mix(in oklab, var(--c-brand-cyan) 12%, transparent)"
                  : "var(--c-surface, #f7f8fc)",
                border:
                  isActive || link.highlight
                    ? "1px solid var(--c-brand-cyan, #0891b2)"
                    : "1px solid var(--c-border, rgba(15,23,42,0.08))",
                touchAction: "manipulation",
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background =
                  "color-mix(in oklab, var(--c-brand-cyan) 12%, transparent)";
                e.currentTarget.style.borderColor =
                  "var(--c-brand-cyan, #0891b2)";
              }}
              onTouchEnd={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "var(--c-surface, #f7f8fc)";
                  e.currentTarget.style.borderColor = link.highlight
                    ? "var(--c-brand-cyan, #0891b2)"
                    : "var(--c-border, rgba(15,23,42,0.08))";
                }
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.opacity = "0.75";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{
                  background:
                    "color-mix(in oklab, var(--c-brand-cyan) 10%, transparent)",
                }}
                aria-hidden
              >
                {link.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[0.8125rem] font-bold leading-tight transition-colors"
                  style={{
                    color: isActive
                      ? "var(--c-brand-cyan, #0891b2)"
                      : "var(--c-text, #0f172a)",
                  }}
                >
                  {link.label}
                </div>
                {link.description && (
                  <div
                    className="text-[0.6875rem] leading-tight mt-0.5"
                    style={{ color: "var(--c-text-muted, #64748B)" }}
                  >
                    {link.description}
                  </div>
                )}
                {link.highlight && (
                  <div
                    className="mt-1 inline-flex items-center gap-1 text-[0.625rem] font-bold tracking-[0.15em] uppercase"
                    style={{ color: "var(--c-brand-cyan, #0891b2)" }}
                  >
                    ⚡ Bonus
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
