"use client";

// Mobile menu drawer. Two-part component:
//   1) The trigger (gradient MENU button) rendered inline in the navbar.
//   2) The drawer (full-viewport overlay) rendered via createPortal to
//      document.body so no ancestor transform / overflow / sticky stacking
//      context can hide it. Mounted only when open === true.
//
// Critical fixes after the v1 mount-failure bug:
//   - PRIMARY_LINKS / RESOURCE_LINKS imported from nav-links (leaf
//     module), not from Navbar — eliminates the circular import that
//     left props undefined at first client render and caused .map() to
//     crash silently inside the drawer.
//   - createPortal to document.body — drawer is a top-level DOM node,
//     guaranteed not to be hidden by any sticky/transformed ancestor.
//   - Explicit fallback colors via CSS-var-with-default
//     (`var(--c-bg, #ffffff)`) so the drawer renders opaque even if
//     theme vars haven't applied yet (or never apply due to hydration
//     ordering).
//   - Inline SVG icons (no lucide dep) so glyphs render on every mobile
//     browser regardless of font/icon-font load timing.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Brand } from "@components/Brand";
import { PRIMARY_LINKS, RESOURCE_LINKS } from "./nav-links";

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

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  // Track whether we've mounted on the client so createPortal doesn't
  // attempt to use document during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
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
              onClick={e => e.stopPropagation()}
            >
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-bold text-lg tracking-tight"
              >
                <Brand size={28} />
                <span>
                  <span style={{ color: "var(--c-text, #0f172a)" }}>
                    Turbo
                  </span>
                  <span className="bg-brand bg-clip-text text-transparent">
                    Loop
                  </span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-[var(--r-md)] active:scale-95 transition"
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

            {/* Drawer body */}
            <div
              className="px-4 py-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Primary nav links */}
              <nav
                className="flex flex-col gap-1 mb-8"
                aria-label="Primary"
              >
                {PRIMARY_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 min-h-[44px] text-base font-bold border-b"
                    style={{
                      color: "var(--c-text, #0f172a)",
                      borderColor:
                        "var(--c-border, rgba(15,23,42,0.08))",
                    }}
                  >
                    {link.label}
                    <span style={{ color: "var(--c-text-subtle, #94A3B8)" }}>
                      →
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Resources */}
              <div className="mb-8">
                <div
                  className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-3"
                  style={{ color: "var(--c-text-subtle, #94A3B8)" }}
                >
                  Resources
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {RESOURCE_LINKS.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 p-3 min-h-[44px] rounded-[var(--r-md)] active:scale-[0.98] transition"
                      style={{
                        background: "var(--c-surface, #f7f8fc)",
                        border:
                          "1px solid var(--c-border, rgba(15,23,42,0.08))",
                      }}
                    >
                      <div
                        className="text-xl w-9 h-9 flex items-center justify-center rounded-[var(--r-md)] flex-shrink-0"
                        style={{
                          background:
                            "color-mix(in oklab, var(--c-brand-cyan) 8%, transparent)",
                        }}
                        aria-hidden
                      >
                        {link.emoji}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-sm font-bold"
                          style={{ color: "var(--c-text, #0f172a)" }}
                        >
                          {link.label}
                        </div>
                        {link.description && (
                          <div
                            className="text-xs mt-0.5 leading-snug"
                            style={{
                              color:
                                "var(--c-text-muted, #64748B)",
                            }}
                          >
                            {link.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Primary CTA */}
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 w-full px-5 h-[52px] min-h-[44px] rounded-[var(--r-lg)] text-base font-bold text-white shadow-[var(--s-brand)] active:scale-[0.985] transition"
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
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="md:hidden inline-flex items-center gap-2 px-3 min-h-[44px] h-11 rounded-[var(--r-lg)] text-white shadow-[var(--s-brand)] active:scale-95 transition"
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
