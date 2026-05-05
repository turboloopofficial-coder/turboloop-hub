"use client";

// Mobile menu drawer. Trigger is the hamburger button (md:hidden), drawer
// covers the viewport on tap. Two link groups: primary nav + Resources.

import { useEffect, useState } from "react";
import { Menu, X, Rocket } from "lucide-react";
import Link from "next/link";

type LinkItem = {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly emoji?: string;
};

interface MobileMenuProps {
  primaryLinks: readonly LinkItem[];
  resourceLinks: readonly LinkItem[];
}

export function MobileMenu({ primaryLinks, resourceLinks }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-[var(--r-md)] text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.06)] active:scale-95 transition"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[var(--z-modal,70)] md:hidden bg-[var(--c-bg)] overflow-y-auto"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
          onClick={() => setOpen(false)}
        >
          {/* Sticky header */}
          <div
            className="sticky top-0 flex items-center justify-between h-[var(--nav-h)] px-[var(--gutter)] border-b border-[var(--c-border)] bg-[var(--c-bg)] z-10"
            onClick={e => e.stopPropagation()}
          >
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-bold text-lg tracking-tight"
            >
              <span className="text-[var(--c-text)]">Turbo</span>
              <span className="bg-brand bg-clip-text text-transparent">
                Loop
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-[var(--r-md)] text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.06)] active:scale-95 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer body */}
          <div
            className="px-[var(--gutter)] py-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Primary nav links */}
            <nav className="flex flex-col gap-1 mb-8">
              {primaryLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 text-base font-bold text-[var(--c-text)] border-b border-[var(--c-border)]"
                >
                  {link.label}
                  <span className="text-[var(--c-text-subtle)]">→</span>
                </Link>
              ))}
            </nav>

            {/* Resources */}
            <div className="mb-8">
              <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
                Resources
              </div>
              <div className="grid grid-cols-1 gap-2">
                {resourceLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] active:scale-[0.98] transition"
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
                      <div className="text-sm font-bold text-[var(--c-text)]">
                        {link.label}
                      </div>
                      {link.description && (
                        <div className="text-xs text-[var(--c-text-muted)] mt-0.5 leading-snug">
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
              className="inline-flex items-center justify-center gap-2 w-full px-5 h-[52px] rounded-[var(--r-lg)] text-base font-bold text-white bg-brand shadow-[var(--s-brand)] active:scale-[0.985] transition"
            >
              <Rocket className="w-4 h-4" />
              Launch App
            </a>
          </div>
        </div>
      )}
    </>
  );
}
