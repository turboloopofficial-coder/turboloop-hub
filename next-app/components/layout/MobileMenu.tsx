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
// Critical fixes preserved from the v1 mount-failure bug:
//   - Pillar arrays imported from nav-links (leaf module), not Navbar —
//     eliminates the circular import that left props undefined at first
//     client render and caused .map() to crash silently.
//   - createPortal to document.body — drawer is a top-level DOM node,
//     guaranteed not to be hidden by any sticky/transformed ancestor.
//   - Explicit fallback colors via CSS-var-with-default so the drawer
//     renders opaque even if theme vars haven't applied yet.
//   - Inline SVG icons (no lucide dep) so glyphs render on every mobile
//     browser regardless of font/icon-font load timing.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
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
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf1);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
                onClick={() => setOpen(false)}
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
                className="inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-[var(--r-md)] active:scale-95 transition"
                style={{
                  background: "var(--c-surface, #f7f8fc)",
                  color: "var(--c-text, #0f172a)",
                  border: "1px solid var(--c-border, rgba(15,23,42,0.08))",
                }}
                aria-label="Close menu"
                type="button"
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
                  onNavigate={() => setOpen(false)}
                />
              ))}

              {/* Primary CTA */}
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center justify-center gap-2 w-full px-5 h-[52px] min-h-[48px] rounded-[var(--r-lg)] text-base font-bold text-white shadow-[var(--s-brand)] active:scale-[0.985] transition"
                style={{ background: "var(--c-brand-gradient)" }}
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="md:hidden inline-flex items-center gap-2 px-3 min-h-[48px] h-11 rounded-[var(--r-lg)] text-white shadow-[var(--s-brand)] active:scale-95 transition"
        style={{ background: "var(--c-brand-gradient)" }}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={DRAWER_ID}
        type="button"
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
  onNavigate,
}: {
  label: string;
  links: ReadonlyArray<NavLinkItem>;
  onNavigate: () => void;
}) {
  return (
    <section className="mb-2">
      <div
        className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase px-1 mb-2 mt-5"
        style={{ color: "var(--c-text-subtle, #94A3B8)" }}
      >
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="flex items-start gap-2.5 p-3 min-h-[56px] rounded-[var(--r-md)] active:scale-[0.97] transition"
            style={{
              background: "var(--c-surface, #f7f8fc)",
              border: link.highlight
                ? "1px solid var(--c-brand-cyan, #0891b2)"
                : "1px solid var(--c-border, rgba(15,23,42,0.08))",
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
                className="text-[0.8125rem] font-bold leading-tight"
                style={{ color: "var(--c-text, #0f172a)" }}
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
        ))}
      </div>
    </section>
  );
}
